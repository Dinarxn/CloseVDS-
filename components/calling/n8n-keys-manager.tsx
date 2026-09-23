"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { N8nIntegrationKey } from "@/types/calling";
import { api, ApiClientError } from "@/lib/api-client";
import { formatCallDateTime } from "@/lib/mappers";

export interface N8nKeysManagerProps {
  keys: N8nIntegrationKey[];
  isLoading?: boolean;
  onKeyCreated: () => void;
  onKeyRevoked: () => void;
}

const AVAILABLE_SCOPES = [
  { id: "voice:read", label: "voice:read", desc: "Inspect call queue, transcripts, and session outcomes" },
  { id: "voice:prepare", label: "voice:prepare", desc: "Execute dry-run safety and context synthesis" },
  { id: "voice:request", label: "voice:request", desc: "Queue calls for human reviewer approval" },
  { id: "crm:write", label: "crm:write", desc: "Synchronize CRM deals, stages, and activities" },
];

export function N8nKeysManager({
  keys,
  isLoading = false,
  onKeyCreated,
  onKeyRevoked,
}: N8nKeysManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    "voice:read",
    "voice:prepare",
    "voice:request",
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // One-time secret reveal state
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const toggleScope = (scopeId: string) => {
    if (selectedScopes.includes(scopeId)) {
      if (selectedScopes.length === 1) return;
      setSelectedScopes(selectedScopes.filter((s) => s !== scopeId));
    } else {
      setSelectedScopes([...selectedScopes, scopeId]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Integration name is required.");
      return;
    }

    if (selectedScopes.length === 0) {
      setErrorMsg("At least one scope must be selected.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.n8n.createKey({
        name: name.trim(),
        scopes: selectedScopes,
        webhookUrl: webhookUrl.trim() || undefined,
      });

      if (res.data) {
        setNewKeySecret(res.data.apiKey);
        setName("");
        setWebhookUrl("");
        onKeyCreated();
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to generate n8n API key.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this n8n integration key? Workflows using it will immediately be rejected with 401 Unauthorized.")) {
      return;
    }

    try {
      await api.n8n.revokeKey(id);
      onKeyRevoked();
    } catch (err) {
      console.error("Failed to revoke key:", err);
    }
  };

  const copyToClipboard = () => {
    if (newKeySecret) {
      navigator.clipboard.writeText(newKeySecret);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Outer Obsidian Container */}
      <div className="relative rounded-xl border border-white/[0.08] bg-[#0c0c12]/90 shadow-xs overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        {/* Section Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
                Access Security Vault
              </span>
              <span className="text-zinc-600 font-mono text-[10px]">•</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                SHA-256 Hashed
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              n8n Workflow Integration Keys
            </h3>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Manage scoped API keys for autonomous n8n workflows. Keys are hashed with SHA-256 and subject to zero-bypass approval rules.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8.5 px-3.5 font-medium shadow-xs shrink-0 self-start sm:self-auto"
          >
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Generate Integration Key
          </Button>
        </div>

        {/* Section Content */}
        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-mono text-zinc-400">Loading n8n integration credentials...</p>
            </div>
          ) : keys.length === 0 ? (
            <div className="relative p-8 sm:p-10 text-center border border-white/[0.07] rounded-lg bg-[#09090f]/80 space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400">
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
                  Scoped Credentials
                </span>
                <h4 className="text-sm font-semibold text-white tracking-tight">
                  No n8n integration keys generated
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Generate an integration key to connect your n8n workflow nodes with fine-grained API scopes.
                </p>
              </div>
              <div className="pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="h-8 px-3 text-xs"
                >
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Generate First Key
                </Button>
              </div>
            </div>
          ) : (
            <div className="border border-white/[0.07] rounded-lg overflow-x-auto bg-[#09090f]/70">
              <table className="w-full text-left text-xs border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[#0c0c14]/90 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-medium">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Key Prefix</th>
                    <th className="py-3 px-4">Granted Scopes</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Used</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {keys.map((k) => (
                    <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-medium">
                        <div className="text-zinc-100 font-medium">{k.name}</div>
                        {k.webhookUrl && (
                          <div className="text-[10px] text-zinc-500 font-mono truncate max-w-xs mt-0.5">
                            {k.webhookUrl}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-400 text-xs">
                        {k.keyPrefix}...
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {k.scopes.map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 text-[10px] rounded bg-white/[0.04] border border-white/[0.07] font-mono text-zinc-300"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium font-mono border ${
                            k.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-white/[0.02] text-zinc-500 border-white/[0.06]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              k.isActive ? "bg-emerald-400" : "bg-zinc-600"
                            }`}
                          />
                          {k.isActive ? "ACTIVE" : "REVOKED"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                        {formatCallDateTime(k.lastUsedAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {k.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-7 px-2"
                            onClick={() => handleRevoke(k.id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create n8n Key */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Generate n8n Integration Key"
        description="Create credentials for n8n orchestrator workflows. The plaintext key will be shown only once upon creation."
      >
        {errorMsg && (
          <Alert variant="destructive" title="Error">
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            id="n8n-key-name"
            label="Integration Name"
            placeholder="e.g., Primary Outreach Node"
            value={name}
            onChange={(e) => setName(e.target.value)}
            helperText="Identifies this automation client."
            required
          />

          <Input
            id="n8n-webhook-url"
            label="Outbound Webhook URL (Optional)"
            placeholder="https://n8n.yourdomain.com/webhook/closevds-events"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            helperText="Receives signed HMAC-SHA256 call completion & outcome events."
          />

          <div>
            <span className="text-xs font-semibold text-white block mb-2">
              Granted Scopes
            </span>
            <div className="space-y-2.5 p-3.5 bg-[#09090e] rounded-lg border border-white/[0.08]">
              {AVAILABLE_SCOPES.map((scope) => (
                <div key={scope.id} className="flex items-start gap-2.5">
                  <Checkbox
                    id={`scope-${scope.id}`}
                    checked={selectedScopes.includes(scope.id)}
                    onChange={() => toggleScope(scope.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <label
                      htmlFor={`scope-${scope.id}`}
                      className="text-xs font-mono font-medium text-white cursor-pointer"
                    >
                      {scope.label}
                    </label>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal">{scope.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Generating..." : "Generate Key"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: One-Time Secret Display */}
      <Dialog
        open={Boolean(newKeySecret)}
        onOpenChange={(open) => {
          if (!open) {
            setNewKeySecret(null);
            setIsCreateOpen(false);
          }
        }}
        title="Save Your Secret Key Now"
        description="This secret will not be shown again. Copy and securely store it in your n8n credentials vault immediately."
      >
        <div className="space-y-4">
          <div className="relative rounded-xl border border-amber-500/25 bg-[#120e09]/90 px-4 py-3.5 shadow-xs overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-amber-200">
                  Irreversible Secret Masking
                </span>
                <p className="text-xs text-amber-200/75 leading-relaxed">
                  closeVDS only stores a one-way cryptographic SHA-256 hash. If you lose this key, you will need to revoke it and generate a new one.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-[#09090e] border border-white/[0.08] rounded-lg space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
              Full n8n API Key
            </span>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs font-mono text-zinc-100 break-all select-all bg-[#050508] p-2 rounded border border-white/[0.06] flex-1">
                {newKeySecret}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={copyToClipboard}
                className="shrink-0 h-8"
              >
                {hasCopied ? (
                  <>
                    <svg className="w-3.5 h-3.5 mr-1 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              onClick={() => {
                setNewKeySecret(null);
                setIsCreateOpen(false);
              }}
            >
              I Have Securely Saved This Key
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
