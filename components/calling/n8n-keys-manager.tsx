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
      console.error("Failed to revoke n8n key:", err);
      alert("Failed to revoke n8n key. Check server connection.");
    }
  };

  const handleCopy = () => {
    if (!newKeySecret) return;
    navigator.clipboard.writeText(newKeySecret);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <>
      <div className="relative rounded-xl border border-white/[0.08] bg-surface-card shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />

        {/* Card Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Automation Infrastructure
              </span>
              <span className="text-zinc-600 font-mono text-[10px]">•</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-surface-elevated text-zinc-300 border border-white/[0.08]">
                Scoped Auth
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              n8n Workflow Credentials &amp; API Keys
            </h3>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed font-sans">
              Authenticate external n8n workflows with granular least-privilege scopes. All API calls remain subject to zero-bypass human approval gates.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setNewKeySecret(null);
              setIsCreateOpen(true);
            }}
            className="h-8.5 px-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-xs shrink-0"
          >
            + Generate n8n Key
          </Button>
        </div>

        {/* Content Table */}
        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-mono text-zinc-400">Querying integration key registry...</p>
            </div>
          ) : keys.length === 0 ? (
            <div className="relative p-8 sm:p-10 text-center border border-white/[0.07] rounded-xl bg-surface-panel space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400">
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
                  Authentication Keys
                </span>
                <h4 className="text-sm font-semibold text-white tracking-tight">
                  No n8n integration keys generated
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed font-sans">
                  Generate scoped credentials to allow n8n workflows to query call states and stage calls for approval.
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-white/[0.08] rounded-xl overflow-x-auto bg-surface-panel shadow-xs">
              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-surface-panel/90 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
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
                    <tr key={k.id} className="hover:bg-violet-950/15 transition-colors">
                      <td className="py-3 px-4 font-medium">
                        <div className="text-white font-medium">{k.name}</div>
                        {k.webhookUrl && (
                          <div className="text-[10px] text-zinc-500 font-mono truncate max-w-xs mt-0.5">
                            {k.webhookUrl}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-300 text-xs">
                        {k.keyPrefix}...
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {k.scopes.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 text-[10px] rounded-full bg-surface-elevated border border-white/[0.08] font-mono text-zinc-300"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium font-mono border ${
                            k.isActive
                              ? "bg-lime-500/10 text-[#C6FF33] border-lime-500/25 font-semibold"
                              : "bg-surface-elevated text-zinc-400 border-white/[0.08]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              k.isActive ? "bg-[#C6FF33]" : "bg-zinc-600"
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
                            className="text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 h-7.5 px-2.5 font-mono"
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
            <span className="text-xs font-semibold text-white block mb-2 font-sans">
              Granted Scopes
            </span>
            <div className="space-y-2.5 p-3.5 bg-surface-panel rounded-xl border border-white/[0.08]">
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
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal font-sans">{scope.desc}</p>
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
              {isSubmitting ? "Generating..." : "Generate Key"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Secret Reveal */}
      <Dialog
        open={Boolean(newKeySecret)}
        onOpenChange={(open) => !open && setNewKeySecret(null)}
        title="Copy Your Plaintext API Key"
        description="This key will NEVER be shown again. Store it securely in your n8n credentials vault."
      >
        <div className="space-y-4">
          <Alert variant="warning" title="Save Key Immediately">
            For security, the database stores only an HMAC hash. If lost, you must generate a new key.
          </Alert>

          <div className="p-3.5 rounded-xl bg-surface-panel border border-violet-500/30 space-y-2">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">
              Plaintext API Key
            </span>
            <div className="font-mono text-xs text-[#C6FF33] break-all select-all p-2 rounded-lg bg-black/40 border border-white/[0.08]">
              {newKeySecret}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => setNewKeySecret(null)}
              className="border-white/[0.08]"
            >
              I Have Saved the Key
            </Button>
            <Button
              variant="primary"
              onClick={handleCopy}
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-xs"
            >
              {hasCopied ? "Copied to Clipboard!" : "Copy Key"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
