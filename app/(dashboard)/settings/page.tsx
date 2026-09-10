"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
      const response = await api.get<{
        data: {
          workspace: { name: string; slug: string };
          settings: {
            dailyEmailCap: number;
            killSwitchActive: boolean;
            requireHumanApproval: boolean;
            antiHallucinationEnforced: boolean;
            autoSuppressionOnOptOut: boolean;
            autoSuppressionOnHardBounce: boolean;
          };
        };
      }>("/settings/workspace");

      if (response?.data?.settings) {
        const s = response.data.settings;
        const ws = response.data.workspace;
        setSettings((prev) => ({
          ...prev,
          general: {
            ...prev.general,
            workspaceName: ws?.name || prev.general.workspaceName,
          },
          safety: {
            ...prev.safety,
            dailyOutreachCap: s.dailyEmailCap || prev.safety.dailyOutreachCap,
            globalKillSwitchActive: Boolean(s.killSwitchActive),
          },
          suppression: {
            ...prev.suppression,
            requireOneClickUnsubscribe: Boolean(s.autoSuppressionOnOptOut),
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
      await api.post("/settings/kill-switch", { active: targetActive });
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
      await api.put("/settings/workspace", {
        workspaceName: settings.general.workspaceName,
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            title="Settings"
            description="Manage acquisition bounds, global kill switches, suppression rules, and AI providers."
            breadcrumbs={[
              { label: "Home", href: "/dashboard" },
              { label: "Settings" },
            ]}
          />

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <Button
              variant={settings.safety.globalKillSwitchActive ? "destructive" : "outline"}
              size="md"
              onClick={handleToggleKillSwitch}
              className="text-xs h-9 font-semibold"
            >
              {settings.safety.globalKillSwitchActive ? "Deactivate Kill Switch" : "Emergency Kill Switch"}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSaveAll}
              disabled={isSaving || isLoading}
              className="text-xs h-9 font-semibold"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center border border-white/[0.08] rounded-xl bg-[#121216]">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-400">Loading workspace settings from server...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="safety">
            <TabList className="w-full">
              <Tab value="safety">Safety Bounds</Tab>
              <Tab value="ai">AI Providers</Tab>
              <Tab value="suppression">Suppression Rules</Tab>
              <Tab value="general">General</Tab>
            </TabList>

            <TabPanel value="safety">
              <SafetyBoundsTab
                safety={settings.safety}
                onChange={handleSafetyChange}
                onOpenKillSwitch={killSwitchModal.onOpen}
              />
            </TabPanel>

            <TabPanel value="ai">
              <AiProviderTab ai={settings.ai} onChange={handleAiChange} />
            </TabPanel>

            <TabPanel value="suppression">
              <SuppressionRulesTab
                suppression={settings.suppression}
                onChange={handleSuppressionChange}
              />
            </TabPanel>

            <TabPanel value="general">
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
