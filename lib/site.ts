import type { ContributionData } from "@/components/contribution-explorer"
import contributions from "@/data/contributions.json"

export type SiteLink = { label: string; href: string }

/** Filled by scripts/fetch-contributions.mjs. Profile and repo are null until the first fetch. */
export type SiteData = ContributionData & {
  profile: { login: string; name: string; links: SiteLink[] } | null
  repo: string | null
}

export const data = contributions as SiteData

/** The original repository. Every copy links back to it from the footer. */
export const TEMPLATE_URL = "https://github.com/moon-drakon/contribution-skyline"

export const siteName = data.profile?.name ?? "Contribution Skyline"
