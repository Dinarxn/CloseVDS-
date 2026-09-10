import { SITE_NAME, SITE_CATEGORY, SITE_TAGLINE } from "@/lib/constants";

export const siteConfig = {
  name: SITE_NAME,
  category: SITE_CATEGORY,
  tagline: SITE_TAGLINE,
  description: `${SITE_NAME} — ${SITE_CATEGORY}. ${SITE_TAGLINE}`,
};

export type SiteConfig = typeof siteConfig;
