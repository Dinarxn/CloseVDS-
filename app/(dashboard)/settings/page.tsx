"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useDisclosure } from "@/hooks/use-disclosure";
import {
  INITIAL_SETTINGS,
  SafetyBoundsTab,
  AiProviderTab,
  SuppressionRulesTab,
  GeneralSettingsTab,
  KillSwitchDialog,
} from "@/components/settings";
import {
  SystemSettings,
  SafetyLimitsConfig,
  AiProviderConfig,
  SuppressionConfig,
  GeneralSettingsConfig,
} from "@/types/settings";
import { api, ApiClientError } from "@/lib/api-client";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("safety");
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const killSwitchModal = useDisclosure({ defaultIsOpen: false });
  const { addToast } = useToast();

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      interface WorkspaceSettingsResponse {
        settings?: {
          name?: string;
          killSwitchActive?: boolean;
          defaultDailyCap?: number;
          safetyThreshold?: number;
          autoSuppressionOnOptOut?: boolean;
          dailyEmailCap?: number;
        };
        workspace?: { name: string; slug: string };
        data?: {
          workspace?: { name: string; slug: string };
          settings?: {
            name?: string;
            dailyEmailCap?: number;
            killSwitchActive?: boolean;
            requireHumanApproval?: boolean;
            antiHallucinationEnforced?: boolean;
            autoSuppressionOnOptOut?: boolean;
            autoSuppressionOnHardBounce?: boolean;
            defaultDailyCap?: number;
          };
        };
      }

      const response = await api.get<WorkspaceSettingsResponse>("/settings/workspace");
      const s = response?.settings || response?.data?.settings;
      if (s) {
        setSettings((prev) => ({
          ...prev,
          general: {
            ...prev.general,
            workspaceName:
              s.name ||
              response?.workspace?.name ||
              response?.data?.workspace?.name ||
              prev.general.workspaceName,
          },
          safety: {
            ...prev.safety,
            dailyOutreachCap: s.defaultDailyCap ?? s.dailyEmailCap ?? prev.safety.dailyOutreachCap,
            globalKillSwitchActive: Boolean(s.killSwitchActive),
          },
          suppression: {
            ...prev.suppression,
            requireOneClickUnsubscribe: Boolean(
              s.autoSuppressionOnOptOut ?? prev.suppression.requireOneClickUnsubscribe
            ),
          },
        }));
      }
    } catch (err) {
      console.error("Failed to load workspace settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSafetyChange = (field: keyof SafetyLimitsConfig, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      safety: { ...prev.safety, [field]: value },
    }));
  };

  const handleAiChange = (field: keyof AiProviderConfig, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      ai: { ...prev.ai, [field]: value },
    }));
  };

  const handleSuppressionChange = (field: keyof SuppressionConfig, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      suppression: { ...prev.suppression, [field]: value },
    }));
  };

  const handleGeneralChange = (field: keyof GeneralSettingsConfig, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      general: { ...prev.general, [field]: value },
    }));
  };

  const handleToggleKillSwitch = () => {
    killSwitchModal.onOpen();
  };

  const executeKillSwitchToggle = async () => {
    const targetActive = !settings.safety.globalKillSwitchActive;
    try {
      await api.patch("/settings/workspace", { killSwitchActive: targetActive });
      setSettings((prev) => ({
        ...prev,
        safety: { ...prev.safety, globalKillSwitchActive: targetActive },
      }));

      addToast({
        title: targetActive ? "Emergency Kill Switch Activated" : "Kill Switch Deactivated",
        description: targetActive
          ? "All outbound outreach actions halted immediately across the workspace."
          : "Outreach dispatch queue resumed normal operations.",
        variant: targetActive ? "error" : "default",
      });
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        addToast({ title: "Error", description: err.message, variant: "error" });
      }
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await api.patch("/settings/workspace", {
        name: settings.general.workspaceName,
        workspaceName: settings.general.workspaceName,
        defaultDailyCap: settings.safety.dailyOutreachCap,
        dailyEmailCap: settings.safety.dailyOutreachCap,
        requireHumanApproval: true,
        antiHallucinationEnforced: settings.ai.strictAntiHallucination,
        autoSuppressionOnOptOut: settings.suppression.requireOneClickUnsubscribe,
        autoSuppressionOnHardBounce: true,
      });

      addToast({
        title: "Settings Saved",
        description: "Workspace configuration updated successfully in PostgreSQL persistence.",
        variant: "success",
      });
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        addToast({ title: "Save Error", description: err.message, variant: "error" });
      } else {
        addToast({ title: "Save Error", description: "Failed to connect to settings service", variant: "error" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header & Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <PageHeader
            title="Settings"
            description="Manage acquisition bounds, global kill switches, suppression rules, and AI providers."
            breadcrumbs={[
              { label: "closeVDS", href: "/dashboard" },
              { label: "Settings" },
            ]}
          />

          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleToggleKillSwitch}
              className={`h-9 px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-xs ${
                settings.safety.globalKillSwitchActive
                  ? "border border-rose-500/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 shadow-rose-950/30"
                  : "border border-rose-500/30 bg-rose-500/[0.05] text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/50 hover:text-rose-300"
              }`}
            >
              <svg className="w-3.5 h-3.5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <span>{settings.safety.globalKillSwitchActive ? "Deactivate Kill Switch" : "Emergency Kill Switch"}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving || isLoading}
              className="h-9 px-4 rounded-lg text-xs font-semibold inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black shadow-xs shadow-emerald-950/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="relative overflow-hidden p-12 text-center border border-white/[0.08] rounded-xl bg-[#0c0c12]">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-xs text-zinc-400">Loading workspace configuration from server...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="safety" variant="pills">
            <TabList className="w-full sm:w-auto">
              <Tab value="safety" className="inline-flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Safety Bounds</span>
              </Tab>
              <Tab value="ai" className="inline-flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" />
                  <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
                </svg>
                <span>AI Providers</span>
              </Tab>
              <Tab value="suppression" className="inline-flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
                <span>Suppression Rules</span>
              </Tab>
              <Tab value="general" className="inline-flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                <span>General</span>
              </Tab>
            </TabList>

            <TabPanel value="safety" className="pt-4">
              <SafetyBoundsTab
                safety={settings.safety}
                onChange={handleSafetyChange}
                onOpenKillSwitch={killSwitchModal.onOpen}
              />
            </TabPanel>

            <TabPanel value="ai" className="pt-4">
              <AiProviderTab ai={settings.ai} onChange={handleAiChange} />
            </TabPanel>

            <TabPanel value="suppression" className="pt-4">
              <SuppressionRulesTab
                suppression={settings.suppression}
                onChange={handleSuppressionChange}
              />
            </TabPanel>

            <TabPanel value="general" className="pt-4">
              <GeneralSettingsTab
                general={settings.general}
                onChange={handleGeneralChange}
              />
            </TabPanel>
          </Tabs>
        )}

        <KillSwitchDialog
          isOpen={killSwitchModal.isOpen}
          onClose={killSwitchModal.onClose}
          isActive={settings.safety.globalKillSwitchActive}
          onConfirmToggle={executeKillSwitchToggle}
        />
      </div>
    </PageContainer>
  );
}
