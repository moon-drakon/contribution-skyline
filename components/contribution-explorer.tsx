"use client"

import * as React from "react"

import ContributionSkyline, { type ContributionDay } from "@/components/ui/contribution-skyline"

export type ContributionData = {
  updated: string | null
  last: ContributionDay[]
  years: Record<string, ContributionDay[]>
}

const LAST = "last"

// ?year=2025 opens that year. Read through useSyncExternalStore so the static HTML
// (no URL on the server) and the first client render agree.
const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange)
  return () => window.removeEventListener("popstate", onChange)
}
const yearFromUrl = () => new URLSearchParams(window.location.search).get("year")
const noYear = () => null

/** The skyline plus a year picker: the rolling last 12 months, then each calendar year. */
export function ContributionExplorer({ data }: { data: ContributionData }) {
  const years = React.useMemo(() => Object.keys(data.years).sort((a, b) => Number(b) - Number(a)), [data])
  const urlYear = React.useSyncExternalStore(subscribe, yearFromUrl, noYear)
  const [picked, setPicked] = React.useState<string | null>(null)
  const selected = picked ?? (urlYear && data.years[urlYear] ? urlYear : LAST)

  // Each choice is written back to the URL so it can be shared.
  const choose = (key: string) => {
    setPicked(key)
    const url = new URL(window.location.href)
    if (key === LAST) url.searchParams.delete("year")
    else url.searchParams.set("year", key)
    window.history.replaceState(null, "", url)
  }

  const isLast = selected === LAST
  const days = isLast ? data.last : (data.years[selected] ?? [])
  const total = days.reduce((sum, d) => sum + d.count, 0)
  // A calendar year runs Jan to Dec, like GitHub's year view. The rolling view ends on the build day.
  const endDate = isLast ? (data.updated ?? undefined) : `${selected}-12-31`
  const title = isLast ? undefined : (
    <>
      <span className="font-semibold tabular-nums">{total.toLocaleString("en-US")}</span>{" "}
      {total === 1 ? "contribution" : "contributions"} in {selected}
    </>
  )

  const options = [{ key: LAST, label: "Last 12 months" }, ...years.map((y) => ({ key: y, label: y }))]

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <nav aria-label="Year" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] lg:order-last lg:mx-0 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
        <ul className="flex gap-1.5 lg:w-36 lg:flex-col">
          {options.map((o) => {
            const active = selected === o.key
            return (
              <li key={o.key}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => choose(o.key)}
                  className={
                    "w-full cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground " +
                    (active
                      ? "bg-foreground font-medium text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground")
                  }
                >
                  {o.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="min-w-0 flex-1">
        <ContributionSkyline data={days} endDate={endDate} title={title} palette="github" defaultView="3d" />
      </div>
    </div>
  )
}
