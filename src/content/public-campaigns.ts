import type { FocusArea } from "@/models/types/operation";

// Public-facing campaigns, shown on the unauthenticated /operations page.
// These mirror real campaigns the movement has publicly backed. No external
// social-media links: one of the old campaign's accounts (OpExposeCPS) was
// later compromised and is no longer movement-controlled, so this page
// deliberately doesn't send visitors to third-party pages we can't vouch for
// as currently legitimate. Detailed, current coordination lives behind login
// in the internal Operation records (src/services/operations).
export type PublicCampaign = {
  codename: string;
  summary: string;
  focusArea: FocusArea;
  /** Shown as a flagged notice on the campaign card, e.g. a compromised account. */
  warning?: string;
};

export const PUBLIC_CAMPAIGNS: PublicCampaign[] = [
  {
    codename: "#OpSafeWinter",
    summary:
      "Cold-weather mutual aid for unhoused neighbors — supply drops, warm clothing, and shelter coordination.",
    focusArea: "Mutual Aid",
  },
  {
    codename: "#OpRight2Rest",
    summary:
      "Opposing the criminalization of homelessness, with legal-observer and media support at the local level.",
    focusArea: "Media & Awareness",
  },
  {
    codename: "#OpFlint",
    summary:
      "Ongoing support for Flint residents fighting for clean water and accountability over the water crisis.",
    focusArea: "Community Defense",
  },
  {
    codename: "#OpBlackSnake / #OpNoDAPL",
    summary:
      "Solidarity with Indigenous-led resistance to pipeline construction through tribal land and water sources, grown out of the Standing Rock encampments.",
    focusArea: "Direct Action Support",
  },
  {
    codename: "#OpMonsanto",
    summary:
      "Corporate-accountability campaigning against agrochemical giants over pesticide and GMO practices.",
    focusArea: "Direct Action Support",
  },
  {
    codename: "#OpFreePalestine",
    summary:
      "International solidarity campaign raising awareness of the humanitarian crisis in Gaza and supporting Palestinian human rights advocacy.",
    focusArea: "Media & Awareness",
  },
  {
    codename: "#OpISIS",
    summary:
      "Identifying and reporting ISIS-affiliated social media accounts and propaganda to disrupt extremist recruitment online.",
    focusArea: "Digital Security",
  },
  {
    codename: "#OpPigRoast",
    summary:
      "Accountability reporting on documented, sourced instances of police misconduct — public-records research, not personal-information targeting.",
    focusArea: "Digital Security",
  },
  {
    codename: "#OpBashTheFash / #OpDomesticTerrorism",
    summary:
      "Monitoring and publicly documenting organized fascist and domestic-terror activity, so communities and platforms can respond before it escalates.",
    focusArea: "Community Defense",
  },
  {
    codename: "IWW Support",
    summary:
      "Backing Industrial Workers of the World organizing drives with strike support, legal-fund boosts, and turnout.",
    focusArea: "Community Defense",
  },
  {
    codename: "#OpExposeCPS",
    summary:
      "Accountability reporting on child protective services abuses, backed by documentation and public records.",
    focusArea: "Media & Awareness",
    warning:
      "This operation's Facebook page was compromised by a hostile infiltrator and is no longer movement-controlled. Don't trust accounts claiming to speak for it.",
  },
];
