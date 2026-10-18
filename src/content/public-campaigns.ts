import type { FocusArea } from "@/models/types/operation";

// Public-facing programs, shown on the unauthenticated /operations page.
// Day-to-day coordination for these lives behind login in the internal
// Operation records (src/services/operations) — this page is the public,
// read-only summary used for outreach and recruitment.
export type PublicCampaign = {
  codename: string;
  summary: string;
  focusArea: FocusArea;
  /** Shown as a flagged notice on the program card, e.g. a compromised account. */
  warning?: string;
};

export const PUBLIC_CAMPAIGNS: PublicCampaign[] = [
  {
    codename: "Breakfast & Mutual Aid Program",
    summary:
      "Weekly free food distribution and supply drops for the neighborhood, modeled on the original Black Panther Party's free breakfast program — no questions asked, no means test.",
    focusArea: "Mutual Aid",
  },
  {
    codename: "Know Your Rights Patrol",
    summary:
      "Trained, unarmed community members observing police encounters and documenting misconduct, and running know-your-rights workshops so neighbors know what their rights actually are before they need them.",
    focusArea: "Community for Self Defense",
  },
  {
    codename: "Self-Defense & De-escalation Training",
    summary:
      "Free, open community classes in self-defense and de-escalation, so communities have the skills to protect themselves and each other without relying on anyone else to do it for them.",
    focusArea: "Community for Self Defense",
  },
  {
    codename: "Batallón History & Language Program",
    summary:
      "Classes and workshops on the real history of the San Patricios, plus Spanish, Irish, and Indigenous-language instruction — cultural education as organizing, not nostalgia.",
    focusArea: "Cultural Education",
  },
  {
    codename: "Immigrant Rights Rapid Response",
    summary:
      "A rapid-response network for ICE and immigration-enforcement activity — know-your-rights materials, legal-aid referrals, and accompaniment for affected families.",
    focusArea: "Anti-Racism & Solidarity",
  },
  {
    codename: "Tenant Defense Network",
    summary:
      "Organizing support for tenants facing eviction or slumlord neglect — turnout, legal-observer coordination, and connections to tenant unions already doing this work.",
    focusArea: "Direct Action Support",
  },
  {
    codename: "Indigenous Land & Water Defense Solidarity",
    summary:
      "Turnout and logistics support for Indigenous-led resistance to pipeline construction and extraction on tribal land and water sources, in the tradition of the Standing Rock encampments.",
    focusArea: "Direct Action Support",
  },
];
