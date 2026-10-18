export interface NavItem {
  id: string;
  label: string;
  href: string;
  isExact?: boolean;
  isPlaceholder?: boolean;
}

/**
 * CloseVDS V2 navigation.
 * Lead acquisition is import-first: the product does not discover leads automatically.
 * Existing routes are preserved while labels are aligned with the V2 workflow.
 */
export const MAIN_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", href: "/dashboard", isExact: true },
  { id: "leads", label: "Leads & Import", href: "/leads" },
  { id: "crm", label: "Sales Pipeline", href: "/crm" },
  { id: "calling", label: "AI Calling Studio", href: "/calling" },
  { id: "outreach", label: "Outreach Center", href: "/outreach" },
  { id: "operations", label: "Tasks & Follow-ups", href: "/operations" },
  { id: "analytics", label: "Analytics", href: "/analytics" },
];

export const CALLING_NAV_ITEMS: NavItem[] = [
  { id: "calling-overview", label: "Calling Overview", href: "/calling", isExact: true },
  { id: "calling-calls", label: "Call Queue & History", href: "/calling/calls" },
  { id: "calling-agents", label: "Voice Agents", href: "/calling/agents" },
  { id: "calling-settings", label: "Telephony & Providers", href: "/calling/settings" },
];

export const FOOTER_NAV_ITEMS: NavItem[] = [
  { id: "settings", label: "Settings & Integrations", href: "/settings" },
];

export const ROUTE_TITLE_MAP: Record<string, string> = {
  "/dashboard": "Overview",
  "/leads": "Leads & Import",
  "/operations": "Tasks & Follow-ups",
  "/crm": "Sales Pipeline",
  "/calling": "AI Calling Studio",
  "/calling/calls": "Call Queue & History",
  "/calling/agents": "Voice Agents",
  "/calling/agents/new": "New Voice Agent",
  "/calling/settings": "Telephony & Providers",
  "/outreach": "Outreach Center",
  "/analytics": "Analytics",
  "/settings": "Settings & Integrations",
};
