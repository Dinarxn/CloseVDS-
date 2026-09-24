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
    super(errorData?.message || `HTTP Error ${statusCode}`);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.code = errorData?.code || 'UNKNOWN_ERROR';
    this.details = errorData?.details;
    this.requestId = errorData?.requestId;
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

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
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

  const config: RequestInit = {
    ...options,
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
      const errorPayload = data?.error;
      const message =
        typeof errorPayload === 'object' && errorPayload?.message
          ? errorPayload.message
          : typeof errorPayload === 'string'
          ? errorPayload
          : data?.message || `HTTP ${response.status}: ${response.statusText || 'Request failed'}`;

      const code =
        typeof errorPayload === 'object' && errorPayload?.code
          ? errorPayload.code
          : 'HTTP_ERROR';

      throw new ApiClientError(response.status, {
        code,
        message,
        details: typeof errorPayload === 'object' ? errorPayload?.details : undefined,
        requestId: typeof errorPayload === 'object' ? errorPayload?.requestId : undefined,
      });
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    // Network or parse error with helpful diagnostics
    const rawMsg = error instanceof Error ? error.message : 'Network request failed';
    const isFetchFail = rawMsg.toLowerCase().includes('failed to fetch') || rawMsg.toLowerCase().includes('networkerror');

    if (process.env.NODE_ENV === 'development' && isFetchFail && typeof window !== 'undefined') {
      console.warn(
        `[closeVDS API Client] Connection failed to ${url}. Verify that the backend API server is running on port 4000.`
      );
    }

    throw new ApiClientError(0, {
      code: 'NETWORK_ERROR',
      message: isFetchFail
        ? `Unable to connect to the closeVDS backend API at ${url}. Please verify the backend server is running.`
        : rawMsg,
    });
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
import type { LeadAiWorkflowResult } from '@/types/leads';
import type { BackendLead } from '@/lib/mappers';
import type { OperationsSummary, OperationTask, QueueItem } from '@/types/operations';

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
};

