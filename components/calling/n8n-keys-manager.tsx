"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
    <div className="space-y-6">
      <Card variant="standard">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>n8n Workflow Integration Keys</CardTitle>
              <CardDescription>
                Manage scoped API keys for autonomous n8n workflows. Keys are hashed with SHA-256 and subject to zero-bypass approval rules.
              </CardDescription>
            </div>
            <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
              + Generate Integration Key
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-xs text-[#737373]">
              Loading n8n integration credentials...
            </div>
          ) : keys.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#737373] bg-[#0a0a0a] rounded-lg border border-[#404040]/50 space-y-2">
              <p className="font-semibold text-white">No n8n integration keys generated</p>
              <p className="text-[#525252]">
                Generate an integration key to connect your n8n workflow nodes.
              </p>
            </div>
          ) : (
            <div className="border border-[#404040] rounded-lg overflow-hidden bg-[#0a0a0a]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#404040] bg-[#171717] text-[#737373] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Key Prefix</th>
                    <th className="py-3 px-4">Granted Scopes</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Used</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#404040]/50 text-white">
                  {keys.map((k) => (
                    <tr key={k.id} className="hover:bg-[#171717]/40 transition-colors">
                      <td className="py-3 px-4 font-medium">
                        <div>{k.name}</div>
                        {k.webhookUrl && (
                          <div className="text-[10px] text-[#737373] font-mono truncate max-w-xs">
                            {k.webhookUrl}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#a3a3a3]">
                        {k.keyPrefix}...
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {k.scopes.map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 text-[10px] rounded bg-[#171717] border border-[#404040] font-mono text-[#d4d4d4]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            k.isActive
                              ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800"
                              : "bg-[#171717] text-[#737373] border border-[#404040]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              k.isActive ? "bg-emerald-400" : "bg-[#737373]"
                            }`}
                          />
                          {k.isActive ? "Active" : "Revoked"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#737373]">
                        {formatCallDateTime(k.lastUsedAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {k.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[11px] text-rose-400 hover:text-rose-300 h-7 px-2"
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
        </CardContent>
      </Card>

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
              <div className="space-y-2 p-3 bg-[#0a0a0a] rounded-lg border border-[#404040]">
                {AVAILABLE_SCOPES.map((scope) => (
                  <div key={scope.id} className="flex items-start gap-2">
                    <Checkbox
                      id={`scope-${scope.id}`}
                      checked={selectedScopes.includes(scope.id)}
                      onChange={() => toggleScope(scope.id)}
                    />
                    <div>
                      <label
                        htmlFor={`scope-${scope.id}`}
                        className="text-xs font-mono font-medium text-white cursor-pointer"
                      >
                        {scope.label}
                      </label>
                      <p className="text-[10px] text-[#737373]">{scope.desc}</p>
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
            <Alert variant="warning" title="Irreversible Secret Masking">
              closeVDS only stores a one-way cryptographic SHA-256 hash. If you lose this key, you will need to revoke it and generate a new one.
            </Alert>

            <div className="p-3 bg-[#0a0a0a] border border-amber-800/80 rounded-lg space-y-2">
              <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider block">
                Full n8n API Key
              </span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-white break-all select-all">
                  {newKeySecret}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {hasCopied ? "Copied!" : "Copy"}
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
