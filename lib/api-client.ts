export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly requestId?: string;

  constructor(statusCode: number, errorData?: ApiErrorResponse['error']) {
    let resolvedMessage = errorData?.message;

    // Structured formatting for Zod validation errors
    if (
      (!resolvedMessage || resolvedMessage === 'Invalid request payload or parameters' || resolvedMessage === 'Validation Failed') &&
      Array.isArray(errorData?.details) &&
      errorData.details.length > 0
    ) {
      const issueSummary = (errorData.details as Array<{ path?: string | Array<string | number>; message?: string }>)
        .map((iss) => {
          const pathStr = Array.isArray(iss.path) ? iss.path.join('.') : iss.path;
          return pathStr ? `${pathStr}: ${iss.message}` : iss.message;
        })
        .filter(Boolean)
        .join(', ');
      if (issueSummary) {
        resolvedMessage = `Validation failed: ${issueSummary}`;
      }
    }

    // Meaningful status-code fallback messaging
    if (!resolvedMessage) {
      switch (statusCode) {
        case 400:
          resolvedMessage = 'Bad Request: The submission could not be processed.';
          break;
        case 401:
          resolvedMessage = 'Session expired or authentication invalid. Please log in again.';
          break;
        case 403:
          resolvedMessage = errorData?.code === 'PERMISSION_GATE_REQUIRED'
            ? 'Human operator approval is required before this action can execute.'
            : 'Access denied: You do not have permission for this workspace action.';
          break;
        case 404:
          resolvedMessage = 'The requested lead or resource was not found.';
          break;
        case 408:
          resolvedMessage = 'Request timed out. Please check your network connection and try again.';
          break;
        case 409:
          resolvedMessage = 'Resource conflict: A record with these details already exists.';
          break;
        case 422:
          resolvedMessage = 'Unprocessable entity: The submitted payload contains invalid data.';
          break;
        case 429:
          resolvedMessage = 'Too many requests. Please slow down and try again shortly.';
          break;
        case 503:
          resolvedMessage = errorData?.code === 'DATABASE_UNAVAILABLE'
            ? 'Cannot reach database server. PostgreSQL connection offline.'
            : errorData?.code === 'KILL_SWITCH_ACTIVE'
            ? 'Global outreach kill switch is currently active.'
            : 'Service temporarily unavailable. Please try again in a moment.';
          break;
        default:
          resolvedMessage = statusCode >= 500
            ? 'An unexpected backend error occurred. Please try again later.'
            : `HTTP Error ${statusCode}`;
      }
    }

    super(resolvedMessage);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.code = errorData?.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'HTTP_ERROR');
    this.details = errorData?.details;
    this.requestId = errorData?.requestId;
  }
}

/**
 * Sanitizes URLs before diagnostic logging to ensure authentication tokens,
 * passwords, or sensitive query parameters are never leaked.
 */
export function sanitizeUrlForDiagnostics(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl, 'http://localhost');
    const sensitiveKeys = ['token', 'secret', 'key', 'password', 'authorization', 'api_key', 'apikey'];
    for (const key of sensitiveKeys) {
      if (parsed.searchParams.has(key)) {
        parsed.searchParams.set(key, 'REDACTED');
      }
    }
    return parsed.pathname + (parsed.search ? parsed.search : '');
  } catch {
    return rawUrl.split('?')[0] || rawUrl;
  }
}

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';
  if (typeof window !== 'undefined') {
    const browserHost = window.location.hostname;
    try {
      const parsed = new URL(envUrl);
      if (
        (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
        (browserHost === 'localhost' || browserHost === '127.0.0.1')
      ) {
        parsed.hostname = browserHost;
        return parsed.toString().replace(/\/$/, '');
      }
    } catch {
      // ignore URL parse errors and return envUrl
    }
    return envUrl.replace(/\/$/, '');
  }
  return envUrl.replace(/\/$/, '');
}

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Include Bearer token from localStorage as fallback for dual-layer authentication
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('closevds_token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Timeout management with cross-compatible AbortController
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let internalController: AbortController | undefined;
  let signal = options.signal;

  if (!signal) {
    internalController = new AbortController();
    signal = internalController.signal;
    const timeoutMs = options.timeoutMs ?? 30000;
    timeoutId = setTimeout(() => {
      internalController?.abort();
    }, timeoutMs);
  }

  const config: RequestInit = {
    ...options,
    signal,
    headers,
    credentials: 'include', // Ensure session cookies are sent/received
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Handle authentication expiry: clear token and notify auth context for non-auth endpoints
      if (response.status === 401 && typeof window !== 'undefined') {
        const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
        if (!isAuthEndpoint) {
          try {
            localStorage.removeItem('closevds_token');
          } catch {
            // Non-blocking storage removal
          }
          window.dispatchEvent(new CustomEvent('closevds:session_expired'));
        }
      }

      const errorPayload = data?.error;
      const message =
        typeof errorPayload === 'object' && errorPayload?.message
          ? errorPayload.message
          : typeof errorPayload === 'string'
          ? errorPayload
          : data?.message;

      const code =
        typeof errorPayload === 'object' && errorPayload?.code
          ? errorPayload.code
          : undefined;

      throw new ApiClientError(response.status, {
        code: code || 'HTTP_ERROR',
        message: message || '',
        details: typeof errorPayload === 'object' ? errorPayload?.details : undefined,
        requestId: typeof errorPayload === 'object' ? errorPayload?.requestId : undefined,
      });
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Handle network timeout aborts
    const isAbort = error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError');
    if (isAbort && internalController?.signal.aborted) {
      throw new ApiClientError(408, {
        code: 'REQUEST_TIMEOUT',
        message: 'The request timed out after 30 seconds. Please check your network connection and try again.',
      });
    }

    // Network or parse error with helpful diagnostics without exposing sensitive parameters
    const rawMsg = error instanceof Error ? error.message : 'Network request failed';
    const isFetchFail = rawMsg.toLowerCase().includes('failed to fetch') || rawMsg.toLowerCase().includes('networkerror');
    const sanitizedPath = sanitizeUrlForDiagnostics(url);

    if (process.env.NODE_ENV === 'development' && isFetchFail && typeof window !== 'undefined') {
      console.warn(
        `[closeVDS API Client] Connection failed to ${sanitizedPath}. Verify that the backend API server is running on port 4000.`
      );
    }

    throw new ApiClientError(0, {
      code: 'NETWORK_ERROR',
      message: isFetchFail
        ? `Unable to connect to the closeVDS backend API at ${sanitizedPath}. Please verify the backend server is running.`
        : rawMsg,
    });
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

import type {
  VoiceCampaign,
  CreateVoiceCampaignInput,
  VoiceAgentConfig,
  CreateVoiceAgentConfigInput,
  CallPreparationResult,
  CallWithRelations,
  CallDispatchResult,
  VoiceSafetyCheckResult,
  PaginatedCallsResponse,
  ListCallsQuery,
  VoiceAnalyticsData,
  ProviderStatusItem,
  N8nCreatedKeyResult,
  N8nIntegrationKey,
  N8nWebhookDelivery,
} from '@/types/calling';
import type {
  LeadAiWorkflowResult,
  CreateLeadInput,
  ImportLeadCandidateInput,
  ImportLeadsResponse,
} from '@/types/leads';
import type { BackendLead, BackendEmailMessage } from '@/lib/mappers';
import type { OperationsSummary, OperationTask, QueueItem } from '@/types/operations';
import type { CRMActivity } from '@/types/crm';

export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T = unknown>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T = unknown>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  voice: {
    getCampaign: (campaignId: string) =>
      apiRequest<{ success: boolean; data: VoiceCampaign | null }>(`/voice/campaigns/${campaignId}`),

    upsertCampaign: (campaignId: string, body: CreateVoiceCampaignInput) =>
      apiRequest<{ success: boolean; data: VoiceCampaign; message: string }>(
        `/voice/campaigns/${campaignId}`,
        { method: 'POST', body: JSON.stringify(body) }
      ),

    getAgentConfigs: () =>
      apiRequest<{ success: boolean; data: VoiceAgentConfig[] }>('/voice/agent-configs'),

    getAgentConfig: (id: string) =>
      apiRequest<{ success: boolean; data: VoiceAgentConfig }>(`/voice/agent-configs/${id}`),

    createAgentConfig: (body: CreateVoiceAgentConfigInput) =>
      apiRequest<{ success: boolean; data: VoiceAgentConfig; message: string }>(
        '/voice/agent-configs',
        { method: 'POST', body: JSON.stringify(body) }
      ),

    updateAgentConfig: (id: string, body: Partial<CreateVoiceAgentConfigInput>) =>
      apiRequest<{ success: boolean; data: VoiceAgentConfig; message: string }>(
        `/voice/agent-configs/${id}`,
        { method: 'PUT', body: JSON.stringify(body) }
      ),

    prepareCall: (body: { campaignId: string; leadId: string; contactId: string; idempotencyKey?: string }) =>
      apiRequest<{ success: boolean; data: CallPreparationResult; message: string }>(
        '/voice/calls/prepare',
        { method: 'POST', body: JSON.stringify(body) }
      ),

    createCall: (body: {
      campaignId: string;
      leadId: string;
      contactId: string;
      agentConfigId?: string | null;
      humanApprovalRequired?: boolean;
      idempotencyKey?: string;
    }) =>
      apiRequest<{ success: boolean; data: CallWithRelations; message: string }>(
        '/voice/calls',
        { method: 'POST', body: JSON.stringify(body) }
      ),

    listCalls: (params?: ListCallsQuery) => {
      const searchParams = new URLSearchParams();
      if (params?.campaignId) searchParams.set('campaignId', params.campaignId);
      if (params?.leadId) searchParams.set('leadId', params.leadId);
      if (params?.contactId) searchParams.set('contactId', params.contactId);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      const qs = searchParams.toString();
      return apiRequest<PaginatedCallsResponse & { success: boolean }>(
        qs ? `/voice/calls?${qs}` : '/voice/calls'
      );
    },

    getCall: (id: string) =>
      apiRequest<{ success: boolean; data: CallWithRelations }>(`/voice/calls/${id}`),

    approveCall: (id: string) =>
      apiRequest<{ success: boolean; data: CallWithRelations; message: string }>(
        `/voice/calls/${id}/approve`,
        { method: 'POST' }
      ),

    rejectCall: (id: string, reason?: string) =>
      apiRequest<{ success: boolean; data: CallWithRelations; message: string }>(
        `/voice/calls/${id}/reject`,
        { method: 'POST', body: JSON.stringify({ reason }) }
      ),

    cancelCall: (id: string, reason?: string) =>
      apiRequest<{ success: boolean; data: CallWithRelations; message: string }>(
        `/voice/calls/${id}/cancel`,
        { method: 'POST', body: JSON.stringify({ reason }) }
      ),

    checkSafety: (id: string) =>
      apiRequest<{ success: boolean; data: VoiceSafetyCheckResult; message: string }>(
        `/voice/calls/${id}/safety-check`,
        { method: 'POST' }
      ),

    dispatchCall: (id: string, options?: { streamUrl?: string }) =>
      apiRequest<{ success: boolean; data: CallDispatchResult; message: string }>(
        `/voice/calls/${id}/dispatch`,
        { method: 'POST', body: JSON.stringify(options || {}) }
      ),

    getVoiceAnalytics: (filter?: { from?: string; to?: string; campaignId?: string }) => {
      const searchParams = new URLSearchParams();
      if (filter?.from) searchParams.set('from', filter.from);
      if (filter?.to) searchParams.set('to', filter.to);
      if (filter?.campaignId) searchParams.set('campaignId', filter.campaignId);
      const qs = searchParams.toString();
      return apiRequest<{ success: boolean; voice: VoiceAnalyticsData }>(
        qs ? `/analytics/voice?${qs}` : '/analytics/voice'
      );
    },
  },

  n8n: {
    createKey: (body: { name: string; scopes: string[]; webhookUrl?: string }) =>
      apiRequest<{ success: boolean; data: N8nCreatedKeyResult; message: string }>(
        '/integrations/n8n/keys',
        { method: 'POST', body: JSON.stringify(body) }
      ),

    listKeys: () =>
      apiRequest<{ success: boolean; data: N8nIntegrationKey[] }>('/integrations/n8n/keys'),

    revokeKey: (id: string) =>
      apiRequest<{ success: boolean; data: { revoked: boolean }; message: string }>(
        `/integrations/n8n/keys/${id}`,
        { method: 'DELETE' }
      ),

    listDeliveries: () =>
      apiRequest<{ success: boolean; data: N8nWebhookDelivery[] }>(
        '/integrations/n8n/deliveries'
      ),
  },

  settings: {
    getProviders: () =>
      apiRequest<{ success: boolean; providers: ProviderStatusItem[] }>('/settings/providers'),
  },

  leads: {
    list: (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      const qs = searchParams.toString();
      return apiRequest<{
        success: boolean;
        data: BackendLead[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(qs ? `/leads?${qs}` : '/leads');
    },

    get: (id: string) =>
      apiRequest<{
        success: boolean;
        lead: BackendLead;
      }>(`/leads/${id}`),

    runAi: (id: string) =>
      apiRequest<{
        success: boolean;
        data: LeadAiWorkflowResult;
      }>(`/leads/${id}/ai`, {
        method: 'POST',
        body: JSON.stringify({}),
      }),

    approve: (id: string, reason?: string) =>
      apiRequest<{
        success: boolean;
        data: {
          leadId: string;
          status: string;
          approval: {
            status: string;
            approvedBy?: string;
            approvedAt?: string;
            reason?: string;
          };
        };
        message: string;
      }>(`/leads/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),

    reject: (id: string, reason?: string) =>
      apiRequest<{
        success: boolean;
        data: {
          leadId: string;
          status: string;
          approval: {
            status: string;
            approvedBy?: string;
            approvedAt?: string;
            reason?: string;
          };
        };
        message: string;
      }>(`/leads/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),

    create: (body: CreateLeadInput) =>
      apiRequest<{
        success: boolean;
        lead: BackendLead;
        serviceRecommendation?: unknown;
      }>('/leads', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    update: (
      id: string,
      body: {
        businessName?: string;
        domain?: string;
        phone?: string;
        address?: string;
        status?: string;
      }
    ) =>
      apiRequest<{
        success: boolean;
        lead: BackendLead;
        serviceRecommendation?: unknown;
      }>(`/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),

    importBatch: (body: { leads: ImportLeadCandidateInput[] }) =>
      apiRequest<ImportLeadsResponse>('/lead-discovery/import-closebds', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  crm: {
    getProfile: (leadId: string) =>
      apiRequest<{
        success: boolean;
        lead: BackendLead;
        activities: CRMActivity[];
        dealSizeEstimate?: number;
      }>(`/crm/leads/${leadId}`),

    getActivities: (leadId: string) =>
      apiRequest<{
        success: boolean;
        activities: CRMActivity[];
      }>(`/crm/leads/${leadId}/activities`),

    recordActivity: (
      leadId: string,
      body: {
        type: 'STAGE_CHANGE' | 'NOTE' | 'CALL_LOG' | 'EMAIL_SENT' | 'EMAIL_REPLIED';
        description: string;
        metadata?: Record<string, unknown>;
      }
    ) =>
      apiRequest<{
        success: boolean;
        activity: CRMActivity;
      }>(`/crm/leads/${leadId}/activities`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    updateStage: (
      leadId: string,
      body: {
        status: string;
        note?: string;
      }
    ) =>
      apiRequest<{
        success: boolean;
        lead: BackendLead;
        activity: CRMActivity;
      }>(`/crm/leads/${leadId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
  },

  campaigns: {
    list: (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      const qs = searchParams.toString();
      return apiRequest<{
        success: boolean;
        data: Array<{
          id: string;
          name: string;
          niche?: string;
          location?: string;
          targetOffer?: string;
          dailyCap?: number;
          status?: string;
          _count?: { leads: number };
        }>;
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
      }>(qs ? `/campaigns?${qs}` : '/campaigns');
    },

    get: (id: string) =>
      apiRequest<{
        success: boolean;
        campaign: {
          id: string;
          name: string;
          niche?: string;
          location?: string;
          targetOffer?: string;
          dailyCap?: number;
          status?: string;
        };
      }>(`/campaigns/${id}`),

    create: (body: {
      name: string;
      niche: string;
      location: string;
      targetOffer: string;
      dailyCap?: number;
    }) =>
      apiRequest<{
        success: boolean;
        campaign: {
          id: string;
          name: string;
          niche: string;
          location: string;
          targetOffer: string;
          dailyCap?: number;
        };
      }>('/campaigns', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  operations: {
    getSummary: () =>
      apiRequest<{ success: boolean; data: OperationsSummary }>('/operations/summary'),

    getQueue: () =>
      apiRequest<{ success: boolean; data: QueueItem[] }>('/operations/queue'),

    getCallReady: () =>
      apiRequest<{ success: boolean; data: OperationTask[] }>('/operations/call-ready'),

    prioritizeQueueItem: (itemId: string, priority: number) =>
      apiRequest<{ success: boolean; data: unknown; message: string }>(
        `/operations/queue/${itemId}/prioritize`,
        { method: 'POST', body: JSON.stringify({ priority }) }
      ),

    cancelQueueItem: (itemId: string, reason?: string) =>
      apiRequest<{ success: boolean; data: unknown; message: string }>(
        `/operations/queue/${itemId}/cancel`,
        { method: 'POST', body: JSON.stringify({ reason }) }
      ),
  },

  outreach: {
    list: () =>
      apiRequest<{
        success?: boolean;
        data?: BackendEmailMessage[] | { items: BackendEmailMessage[] };
        items?: BackendEmailMessage[];
      }>('/outreach'),

    get: (id: string) =>
      apiRequest<{
        success?: boolean;
        data?: BackendEmailMessage;
        draft?: BackendEmailMessage;
      }>(`/outreach/${id}`),

    create: (body: {
      leadId: string;
      subject: string;
      bodyText: string;
      toEmail?: string;
      fromName?: string;
    }) =>
      apiRequest<{
        success: boolean;
        data: BackendEmailMessage;
        message?: string;
      }>('/outreach', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    update: (
      id: string,
      body: {
        subject?: string;
        bodyText?: string;
      }
    ) =>
      apiRequest<{
        success: boolean;
        data: BackendEmailMessage;
        message?: string;
      }>(`/outreach/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),

    approve: (id: string, notes?: string) =>
      apiRequest<{ success: boolean; message?: string }>(`/outreach/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      }),

    reject: (id: string, reason?: string) =>
      apiRequest<{ success: boolean; message?: string }>(`/outreach/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),

    cancel: (id: string, reason?: string) =>
      apiRequest<{ success: boolean; message?: string }>(`/outreach/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),

    dispatch: (id: string) =>
      apiRequest<{ success: boolean; message?: string }>(`/outreach/${id}/dispatch`, {
        method: 'POST',
      }),
  },
};

