export interface NavItem {
  id: string;
  label: string;
  href: string;
  isExact?: boolean;
  isPlaceholder?: boolean;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", href: "/dashboard", isExact: true },
  { id: "leads", label: "Leads", href: "/leads" },
  { id: "operations", label: "Operations", href: "/operations" },
  { id: "calling", label: "AI Calling", href: "/calling" },
  { id: "crm", label: "CRM", href: "/crm" },
  { id: "analytics", label: "Analytics", href: "/analytics" },
];

export const CALLING_NAV_ITEMS: NavItem[] = [
  { id: "calling-overview", label: "Dashboard", href: "/calling", isExact: true },
  { id: "calling-calls", label: "Call Queue", href: "/calling/calls" },
  { id: "calling-agents", label: "Voice Agents", href: "/calling/agents" },
  { id: "calling-settings", label: "n8n & Telephony", href: "/calling/settings" },
];

export const FOOTER_NAV_ITEMS: NavItem[] = [
  { id: "settings", label: "Settings", href: "/settings" },
];

export const ROUTE_TITLE_MAP: Record<string, string> = {
  "/dashboard": "Overview",
  "/leads": "Lead Pool",
  "/operations": "Operations",
  "/crm": "CRM Pipeline",
  "/calling": "AI Calling",
  "/calling/calls": "Call Queue",
  "/calling/agents": "Voice Agents",
  "/calling/agents/new": "New Voice Agent",
  "/calling/settings": "Calling & n8n Gateway",
  "/analytics": "Acquisition Analytics",
  "/settings": "Settings",
};


