import ContributionSkyline, { type ContributionDay } from "@/components/ui/contribution-skyline"
import contributions from "@/data/contributions.json"

const data = contributions as ContributionDay[]

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col gap-8 px-4 py-12 sm:px-8 sm:py-16">
      <header className="flex flex-col gap-2">
        <a
          href="https://github.com/moon-drakon"
          className="w-fit font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          github.com/moon-drakon
        </a>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Shibli Rahman Moon</h1>
        <p className="max-w-[62ch] text-muted-foreground">
          A year of GitHub contributions. Switch between the heat map and the 3D skyline. Hover or tap a day for its
          count, and drag the skyline to orbit it.
        </p>
      </header>

      <ContributionSkyline data={data} palette="github" defaultView="3d" />

      <footer className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6">
        <span>Data refreshes daily from the GitHub API.</span>
        <span>
          Chart:{" "}
          <a
            href="https://21st.dev/@kedhareswer/components/contribution-skyline"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Contribution Skyline by kedhareswer
          </a>
        </span>
        <a
          href="https://www.linkedin.com/in/drakon/"
          className="underline underline-offset-4 transition-colors hover:text-foreground"
        >
          LinkedIn
        </a>
      </footer>
    </main>
  )
}
