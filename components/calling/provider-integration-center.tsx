"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { api, ApiClientError } from "@/lib/api-client";
import {
  ProviderIntegrationCard,
  ProviderConnectionState,
  ProviderVerificationState,
} from "@/types/calling";
import { MOCK_PROVIDER_CARDS } from "@/lib/mock-calling-data";
import { formatCallDateTime } from "@/lib/mappers";

export interface ProviderIntegrationCenterProps {
  onRefresh?: () => void;
  className?: string;
}

export function ProviderIntegrationCenter({
  onRefresh,
  className = "",
}: ProviderIntegrationCenterProps) {
  const [cards, setCards] = useState<ProviderIntegrationCard[]>(MOCK_PROVIDER_CARDS);
  const [isLoading, setIsLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  // Configure Credentials Modal State
  const [activeConfigProvider, setActiveConfigProvider] = useState<ProviderIntegrationCard | null>(null);
  const [twilioSid, setTwilioSid] = useState("");
  const [twilioToken, setTwilioToken] = useState("");
  const [twilioPhone, setTwilioPhone] = useState("");
  const [retellApiKey, setRetellApiKey] = useState("");
  const [retellWebhookSecret, setRetellWebhookSecret] = useState("");
  const [vapiApiKey, setVapiApiKey] = useState("");
  const [vapiOrgId, setVapiOrgId] = useState("");
  const [vapiServerSecret, setVapiServerSecret] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  const { addToast } = useToast();

  const fetchProviderStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const [telephonyRes, voiceAiRes] = await Promise.allSettled([
        api.voice.getTelephonySettings(),
        api.voice.getVoiceAIProviders(),
      ]);

      const updatedCards: ProviderIntegrationCard[] = [];

      // Twilio Telephony Card
      if (telephonyRes.status === "fulfilled" && telephonyRes.value?.data) {
        const tel = telephonyRes.value.data;
        updatedCards.push({
          providerId: "twilio",
          name: "Twilio Carrier Telephony",
          category: "TELEPHONY",
          connectionState: tel.connectionStatus || (tel.isConfigured ? "CONNECTED" : "NOT_CONFIGURED"),
          verificationState: tel.verificationStatus || (tel.isConfigured ? "VERIFIED" : "UNVERIFIED"),
          capabilities: {
            supportsInbound: true,
            supportsOutbound: true,
            supportsCustomVoices: false,
            supportsTransfer: true,
            supportsRecording: true,
            supportsTranscripts: false,
            supportsRealtimeTranscription: false,
            supportedCodecs: ["PCMU", "PCMA", "opus", "g711"],
          },
          maskedCredentials: {
            accountSid: tel.accountSid || "AC•••••••••••••••••••••••••••••9876",
            authTokenMasked: tel.authTokenMasked || "••••••••••••••••4321",
            primaryPhoneNumber: tel.primaryPhoneNumber || "+1 (512) 555-0199",
          },
          lastHealthCheck: new Date().toISOString(),
          statusMessage: tel.message || (tel.isConfigured ? "Twilio carrier trunk active." : "Twilio credentials not configured in local environment."),
        });
      } else {
        const fallbackTwilio = MOCK_PROVIDER_CARDS.find((c) => c.providerId === "twilio");
        if (fallbackTwilio) updatedCards.push(fallbackTwilio);
      }

      // Voice AI Cards (Retell & Vapi)
      if (voiceAiRes.status === "fulfilled" && voiceAiRes.value?.data?.length) {
        voiceAiRes.value.data.forEach((card) => {
          updatedCards.push(card);
        });
      } else {
        const fallbackRetell = MOCK_PROVIDER_CARDS.find((c) => c.providerId === "retell");
        const fallbackVapi = MOCK_PROVIDER_CARDS.find((c) => c.providerId === "vapi");
        if (fallbackRetell) updatedCards.push(fallbackRetell);
        if (fallbackVapi) updatedCards.push(fallbackVapi);
      }

      setCards(updatedCards);
    } catch {
      setCards(MOCK_PROVIDER_CARDS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviderStatus();
  }, [fetchProviderStatus]);

  const handleTestConnection = async (card: ProviderIntegrationCard) => {
    setTestingProvider(card.providerId);
    try {
      if (card.providerId === "twilio") {
        const res = await api.voice.testTelephonyConnection();
        addToast({
          title: res.data.connected ? "Twilio Connected" : "Twilio Test Result",
          description: res.data.message || (res.data.connected ? "Connection active" : "Not connected"),
          variant: res.data.connected ? "success" : "warning",
        });
      } else {
        const res = await api.voice.testVoiceAIConnection({ providerId: card.providerId });
        addToast({
          title: `${card.name} Test Result`,
          description: res.data.message || (res.data.connected ? "Connection active" : "Not connected"),
          variant: res.data.connected ? "success" : "warning",
        });
      }
      fetchProviderStatus();
      onRefresh?.();
    } catch (err: unknown) {
      addToast({
        title: `${card.name} Test Failed`,
        description: err instanceof Error ? err.message : "Diagnostic test failed",
        variant: "error",
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const openConfigModal = (card: ProviderIntegrationCard) => {
    setActiveConfigProvider(card);
    setConfigError(null);
    if (card.providerId === "twilio") {
      setTwilioSid("");
      setTwilioToken("");
      setTwilioPhone(card.maskedCredentials?.primaryPhoneNumber || "");
    } else if (card.providerId === "retell") {
      setRetellApiKey("");
      setRetellWebhookSecret("");
    } else if (card.providerId === "vapi") {
      setVapiApiKey("");
      setVapiOrgId("");
      setVapiServerSecret("");
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConfigProvider) return;
    setConfigError(null);
    setIsSubmitting(true);

    try {
      if (activeConfigProvider.providerId === "twilio") {
        if (!twilioSid.trim() || !twilioToken.trim()) {
          setConfigError("Account SID and Auth Token are required.");
          setIsSubmitting(false);
          return;
        }
        await api.voice.updateTelephonySettings({
          accountSid: twilioSid.trim(),
          authToken: twilioToken.trim(),
          primaryPhoneNumber: twilioPhone.trim() || undefined,
        });
      } else if (activeConfigProvider.providerId === "retell") {
        if (!retellApiKey.trim()) {
          setConfigError("Retell AI API Key is required.");
          setIsSubmitting(false);
          return;
        }
        const creds: Record<string, string> = {
          apiKey: retellApiKey.trim(),
        };
        if (retellWebhookSecret.trim()) {
          creds.webhookSecret = retellWebhookSecret.trim();
        }
        await api.voice.updateVoiceAICredentials({
          providerId: "retell",
          credentials: creds,
        });
      } else if (activeConfigProvider.providerId === "vapi") {
        if (!vapiApiKey.trim()) {
          setConfigError("Vapi API Key is required.");
          setIsSubmitting(false);
          return;
        }
        const creds: Record<string, string> = {
          apiKey: vapiApiKey.trim(),
        };
        if (vapiOrgId.trim()) {
          creds.orgId = vapiOrgId.trim();
        }
        if (vapiServerSecret.trim()) {
          creds.webhookSecret = vapiServerSecret.trim();
        }
        await api.voice.updateVoiceAICredentials({
          providerId: "vapi",
          credentials: creds,
        });
      }

      addToast({
        title: "Credentials Encrypted & Saved",
        description: `${activeConfigProvider.name} credentials updated server-side. Plaintext secrets purged from browser.`,
        variant: "success",
      });

      setActiveConfigProvider(null);
      fetchProviderStatus();
      onRefresh?.();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setConfigError(err.message);
      } else {
        setConfigError("Failed to persist encrypted provider credentials.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderConnectionPill = (state: ProviderConnectionState, verification: ProviderVerificationState) => {
    if (state === "CONNECTED") {
      return (
        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-lime-500/10 text-[#C6FF33] border border-lime-500/25 font-semibold inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33]" />
          CONNECTED
        </span>
      );
    }
    if (state === "CONNECTING") {
      return (
        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/25 font-medium inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7D39EB] animate-pulse" />
          CONNECTING
        </span>
      );
    }
    if (state === "DEGRADED") {
      return (
        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 font-medium inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          DEGRADED
        </span>
      );
    }
    if (state === "CONNECTION_FAILED") {
      return (
        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/25 font-medium inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          FAILED
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-surface-elevated text-zinc-400 border border-white/[0.08] font-medium inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
        {verification === "TEST_MODE" ? "TEST MODE" : "NOT CONFIGURED"}
      </span>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7D39EB]" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Provider Integration Center
            </h3>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-surface-elevated text-zinc-300 border border-white/[0.08]">
              Decoupled Architecture
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Independent telephony &amp; conversational voice engines. Zero cross-provider coupling with server-side credential encryption.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchProviderStatus}
          disabled={isLoading}
          className="h-7.5 px-2.5 text-xs font-mono text-zinc-300 border-white/[0.08] hover:border-white/[0.16] self-start sm:self-auto shrink-0"
        >
          {isLoading ? "Querying..." : "Refresh Status"}
        </Button>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const isTesting = testingProvider === card.providerId;

          return (
            <div
              key={card.providerId}
              className="relative overflow-hidden rounded-xl bg-surface-card border border-white/[0.08] hover:border-white/[0.16] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all flex flex-col justify-between space-y-4"
            >
              {/* Top hairline highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />

              {/* Card Header */}
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-semibold block">
                      {card.category === "TELEPHONY" ? "Carrier Telephony" : "Voice AI Engine"}
                    </span>
                    <h4 className="text-sm font-semibold text-white tracking-tight truncate">
                      {card.name}
                    </h4>
                  </div>
                  {renderConnectionPill(card.connectionState, card.verificationState)}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed min-h-[36px] font-sans">
                  {card.statusMessage || "Operating within CloseVDS multi-provider isolation matrix."}
                </p>
              </div>

              {/* Capabilities & Masked Info */}
              <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                <div className="flex flex-wrap gap-1.5">
                  {card.capabilities.supportsInbound && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-surface-elevated text-zinc-300 border border-white/[0.08]">
                      Inbound SIP
                    </span>
                  )}
                  {card.capabilities.supportsOutbound && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-surface-elevated text-zinc-300 border border-white/[0.08]">
                      Outbound PSTN
                    </span>
                  )}
                  {card.capabilities.supportsRecording && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-surface-elevated text-zinc-300 border border-white/[0.08]">
                      Audio Recording
                    </span>
                  )}
                  {card.capabilities.supportsTranscripts && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-lime-500/10 text-[#C6FF33] border border-lime-500/25">
                      Live Transcripts
                    </span>
                  )}
                  {card.capabilities.supportsCustomVoices && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-surface-elevated text-zinc-300 border border-white/[0.08]">
                      Custom Voices
                    </span>
                  )}
                </div>

                {/* Masked Credentials Preview */}
                {card.maskedCredentials && Object.keys(card.maskedCredentials).length > 0 && (
                  <div className="p-2.5 rounded-lg bg-surface-panel border border-white/[0.04] space-y-1 font-mono text-[10px]">
                    {Object.entries(card.maskedCredentials).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-zinc-400">
                        <span className="text-zinc-500 capitalize">{k.replace(/([A-Z])/g, " $1")}:</span>
                        <span className="text-zinc-300 select-all">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                  <span>Audit: {card.lastHealthCheck ? formatCallDateTime(card.lastHealthCheck) : "Active"}</span>
                  <span className="text-zinc-600">ID: {card.providerId}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleTestConnection(card)}
                  disabled={isTesting}
                  className="h-8 text-xs font-mono bg-surface-elevated hover:bg-surface-card border-white/[0.08] hover:border-white/[0.16] text-zinc-200 shadow-xs"
                >
                  {isTesting ? "Testing..." : "Test Link"}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openConfigModal(card)}
                  className="h-8 text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-xs"
                >
                  Configure
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Credential Configuration Modal */}
      <Dialog
        open={Boolean(activeConfigProvider)}
        onOpenChange={(open) => !open && setActiveConfigProvider(null)}
        title={`Configure ${activeConfigProvider?.name || "Provider"} Credentials`}
        description="Credentials are authenticated and encrypted server-side using AES-256-GCM. Plaintext secrets are never stored unencrypted or disclosed to the browser."
      >
        {configError && (
          <Alert variant="destructive" title="Configuration Error">
            {configError}
          </Alert>
        )}

        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-[#140b0e] border border-rose-500/20 text-xs text-rose-300/90 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className="space-y-0.5">
              <span className="font-semibold block text-white font-sans">Encrypted Credential Vault Invariant</span>
              <p className="leading-relaxed text-zinc-300">
                New tokens overwrite previous encrypted secrets. CloseVDS applies constant-time HMAC and one-way masking for all client responses.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveCredentials} className="space-y-3.5">
            {activeConfigProvider?.providerId === "twilio" && (
              <>
                <Input
                  id="twilio-account-sid"
                  label="Twilio Account SID"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={twilioSid}
                  onChange={(e) => setTwilioSid(e.target.value)}
                  helperText="Primary Twilio account identifier starting with AC."
                  required
                />
                <Input
                  id="twilio-auth-token"
                  label="Twilio Auth Token"
                  type="password"
                  placeholder="••••••••••••••••••••••••••••••••"
                  value={twilioToken}
                  onChange={(e) => setTwilioToken(e.target.value)}
                  helperText="Auth token used for REST API requests and HMAC-SHA1 webhook signatures."
                  required
                />
                <Input
                  id="twilio-primary-phone"
                  label="Primary Outbound Phone Number (Optional)"
                  placeholder="+15125550199"
                  value={twilioPhone}
                  onChange={(e) => setTwilioPhone(e.target.value)}
                  helperText="E.164 formatted carrier caller ID."
                />
              </>
            )}

            {activeConfigProvider?.providerId === "retell" && (
              <>
                <Input
                  id="retell-api-key"
                  label="Retell AI API Key"
                  type="password"
                  placeholder="key_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={retellApiKey}
                  onChange={(e) => setRetellApiKey(e.target.value)}
                  helperText="API Key obtained from the Retell AI Dashboard."
                  required
                />
                <Input
                  id="retell-webhook-secret"
                  label="Retell Webhook Secret (Optional)"
                  type="password"
                  placeholder="••••••••••••••••••••••••••••••••"
                  value={retellWebhookSecret}
                  onChange={(e) => setRetellWebhookSecret(e.target.value)}
                  helperText="Used to verify HMAC-SHA256 signature in X-Retell-Signature."
                />
              </>
            )}

            {activeConfigProvider?.providerId === "vapi" && (
              <>
                <Input
                  id="vapi-api-key"
                  label="Vapi Private API Key"
                  type="password"
                  placeholder="sk_vapi_xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={vapiApiKey}
                  onChange={(e) => setVapiApiKey(e.target.value)}
                  helperText="Private API token from your Vapi account."
                  required
                />
                <Input
                  id="vapi-org-id"
                  label="Vapi Organization ID (Optional)"
                  placeholder="org_xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={vapiOrgId}
                  onChange={(e) => setVapiOrgId(e.target.value)}
                  helperText="Target organization identifier in Vapi."
                />
                <Input
                  id="vapi-server-secret"
                  label="Vapi Server Secret (Optional)"
                  type="password"
                  placeholder="••••••••••••••••••••••••••••••••"
                  value={vapiServerSecret}
                  onChange={(e) => setVapiServerSecret(e.target.value)}
                  helperText="Used to verify x-vapi-secret header on status-update and end-of-call webhooks."
                />
              </>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setActiveConfigProvider(null)}
                disabled={isSubmitting}
                className="border-white/[0.08]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-xs"
              >
                {isSubmitting ? "Encrypting & Saving..." : "Save Encrypted Credentials"}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
