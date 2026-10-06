import { ContributionExplorer, type ContributionData } from "@/components/contribution-explorer"
import contributions from "@/data/contributions.json"

const data = contributions as ContributionData

const updated = data.updated
  ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
      new Date(`${data.updated}T00:00:00Z`),
    )
  : null

const links = [
  { label: "GitHub", href: "https://github.com/moon-drakon" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/drakon/" },
  { label: "Email", href: "mailto:shibimoon08@gmail.com" },
  { label: "Source", href: "https://github.com/moon-drakon/contribution-skyline" },
]

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-8 px-4 py-12 sm:px-8 sm:py-16">
      <header className="flex flex-col gap-2">
        <a
          href="https://github.com/moon-drakon"
          className="w-fit font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          github.com/moon-drakon
        </a>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Shibli Rahman Moon</h1>
        <p className="max-w-[62ch] text-muted-foreground">
          My GitHub contributions, year by year. Switch between the heat map and the 3D skyline. Hover or tap a day for
          its count, and drag the skyline to orbit it.
        </p>
      </header>

      <ContributionExplorer data={data} />

      <footer className="flex flex-col gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>{updated ? `Updated ${updated} from the GitHub API` : "Updated daily from the GitHub API"}</span>
        <nav aria-label="Links" className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
      </footer>
    </main>
  )
}
