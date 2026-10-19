import { OutreachTemplate, PersonalizationContext } from "@/types/outreach";
import { cleanBusinessName } from "./lead-import";

export const OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: "email_website_gaps",
    title: "Website & Booking Gap Walkthrough",
    channel: "email",
    category: "website_audit",
    subjectTemplate: "Quick observation regarding {{businessName}}'s online booking",
    bodyTemplate: `Hi {{contactName}},

I came across {{businessName}} while auditing healthcare providers in {{city}}.

Our automated benchmark noticed that while your clinic has a strong reputation, {{observedGap}}. In similar practices, this friction leads to prospective patients bouncing to competitors during evenings and weekends.

We put together a brief, 3-minute video breakdown illustrating how adding automated appointment scheduling could help {{businessName}} capture an estimated 10–15 additional bookings per month.

Would you be open to reviewing the walkthrough?

Best regards,
{{senderName}}
{{senderCompany}}`,
    description: "Fact-grounded email pointing out website booking or mobile friction with a 3-minute walkthrough offer.",
    suggestedCallToAction: "Would you be open to reviewing the walkthrough?",
  },
  {
    id: "email_ai_receptionist",
    title: "AI Voice Receptionist & Missed Call Intake",
    channel: "email",
    category: "ai_receptionist",
    subjectTemplate: "After-hours patient call handling for {{businessName}} in {{city}}",
    bodyTemplate: `Hi {{contactName}},

Running a busy practice at {{businessName}} means staff can't always answer every incoming call during peak clinic hours or over weekends.

Studies show that over 60% of prospective patients who reach voicemail hang up and call the next practice on Google Maps.

We implement 24/7 AI Voice Receptionists specifically trained on dental and clinical workflows. It answers immediately, qualifies insurance/service needs, and schedules appointments directly into your calendar without burdening your front desk.

Are you available for a brief 5-minute demonstration later this week?

Best regards,
{{senderName}}
{{senderCompany}}`,
    description: "Pitch for AI front-desk call handling to eliminate missed patient calls and voicemail drop-offs.",
    suggestedCallToAction: "Are you available for a brief 5-minute demonstration later this week?",
  },
  {
    id: "email_general_followup",
    title: "Acquisition & Audit Follow-up",
    channel: "email",
    category: "general_followup",
    subjectTemplate: "Follow-up: Client acquisition overview for {{businessName}}",
    bodyTemplate: `Hi {{contactName}},

Following up on our preliminary audit for {{businessName}}.

We've finalized the digital intake analysis for your practice in {{city}}. There are two high-leverage opportunities we identified to increase patient acquisition from your existing search traffic:

1. Streamlining the direct online consultation funnel.
2. Automating after-hours inquiry responses.

If you have 5 minutes this week, I'd be glad to share the audit findings with your team.

Warm regards,
{{senderName}}
{{senderCompany}}`,
    description: "Follow-up touchpoint for leads previously audited or in the review sequence.",
    suggestedCallToAction: "If you have 5 minutes this week, I'd be glad to share the audit findings.",
  },
  {
    id: "whatsapp_concierge_intro",
    title: "Direct WhatsApp Practice Intro",
    channel: "whatsapp",
    category: "speed_to_lead",
    bodyTemplate: `Hi {{contactName}}, noticed *{{businessName}}* on Google Maps in {{city}}.

We completed a quick digital intake audit and noticed a simple opportunity to improve patient booking flow on {{domain}}.

We put together a 2-minute walkthrough. Open to taking a quick look?`,
    description: "Short, non-spammy WhatsApp message designed for fast mobile reading.",
    suggestedCallToAction: "Open to taking a quick look?",
  },
  {
    id: "whatsapp_missed_calls",
    title: "WhatsApp Missed Call Recovery",
    channel: "whatsapp",
    category: "ai_receptionist",
    bodyTemplate: `Hello {{contactName}}, reaching out regarding *{{businessName}}*.

We help healthcare practices in {{city}} capture patient inquiries when the front desk is busy with an automated 24/7 assistant.

Would you be open to a 3-minute demo link?`,
    description: "Fast WhatsApp message focusing on front-desk call volume relief.",
    suggestedCallToAction: "Would you be open to a 3-minute demo link?",
  },
  {
    id: "phone_intro_script",
    title: "Phone Script: Gatekeeper to Practice Manager",
    channel: "phone",
    category: "speed_to_lead",
    bodyTemplate: `[GATEKEEPER OPENER]
"Hi there, my name is {{senderName}} with {{senderCompany}}. I was hoping to speak with the practice manager or doctor regarding {{businessName}}'s online patient booking flow."

[IF ASKED WHAT IT'S ABOUT]
"We ran a preliminary digital intake audit on {{domain}} and identified a few gaps where patients may be dropping off before booking. I wanted to share a 2-minute summary directly with the practice manager."

[WHEN CONNECTED TO DECISION MAKER]
"Hi {{contactName}}, thanks for taking my call. My name is {{senderName}} with {{senderCompany}}. We recently audited healthcare clinics in {{city}} and noticed {{businessName}} has great patient reviews, but {{observedGap}}.

We help clinics capture those missed inquiries automatically. Would you be open to a brief 5-minute screen share this Thursday to see how it works?"`,
    description: "Structured phone script with gatekeeper handling and decision-maker elevator pitch.",
    suggestedCallToAction: "Would you be open to a brief 5-minute screen share this Thursday?",
  },
];

/**
 * Safely interpolates template placeholders using verified lead context.
 * Guarantees no 'undefined', 'null', or raw template tokens are left in output.
 */
export function interpolateTemplate(
  template: string,
  context: PersonalizationContext
): string {
  if (!template) return "";

  const businessName = cleanBusinessName(context.businessName || "Your Business");
  const contactName = context.contactName?.trim() || `Team at ${businessName}`;
  const city = context.city?.trim() || "your area";
  const domain = context.domain?.trim() || "your website";
  const senderName = context.senderName?.trim() || "Alex Vance";
  const senderCompany = context.senderCompany?.trim() || "closeVDS Acquisition OS";

  let observedGap = "there is no clear online appointment booking widget visible";
  if (context.observedGaps && context.observedGaps.length > 0 && context.observedGaps[0].trim()) {
    observedGap = context.observedGaps[0].trim().replace(/\.$/, "");
  } else if (context.serviceOpportunity) {
    observedGap = `there is an opportunity to add ${context.serviceOpportunity.toLowerCase()}`;
  }

  return template
    .replace(/\{\{\s*businessName\s*\}\}/g, businessName)
    .replace(/\{\{\s*contactName\s*\}\}/g, contactName)
    .replace(/\{\{\s*city\s*\}\}/g, city)
    .replace(/\{\{\s*domain\s*\}\}/g, domain)
    .replace(/\{\{\s*website\s*\}\}/g, domain)
    .replace(/\{\{\s*observedGap\s*\}\}/g, observedGap)
    .replace(/\{\{\s*serviceOpportunity\s*\}\}/g, context.serviceOpportunity || "automated patient intake")
    .replace(/\{\{\s*senderName\s*\}\}/g, senderName)
    .replace(/\{\{\s*senderCompany\s*\}\}/g, senderCompany)
    // Clean up any stray unreplaced tokens safely
    .replace(/\{\{\s*[\w.-]+\s*\}\}/g, "");
}

/**
 * Formats a clean WhatsApp URL for direct messaging.
 * Returns null if phone number cannot be resolved to digits.
 */
export function buildWhatsAppLink(rawPhone: string, message: string): string | null {
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits || digits.length < 7) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Formats a mailto: URL for default email client.
 */
export function buildMailtoLink(
  toEmail: string,
  subject: string,
  body: string
): string {
  return `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}
