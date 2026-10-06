// Writes data/contributions.json: the rolling last 12 months, plus every calendar
// year that has contributions. Only days with a count above zero are stored; the
// chart treats missing days as zero.
//
//   GITHUB_TOKEN=... GH_LOGIN=moon-drakon node scripts/fetch-contributions.mjs
//
// The deploy workflow runs this before each build. GitHub caps one query at a
// year, so each window is fetched on its own.
import { mkdir, writeFile } from "node:fs/promises"

const token = process.env.GITHUB_TOKEN
const login = process.env.GH_LOGIN
if (!token || !login) {
  console.error("Set GITHUB_TOKEN and GH_LOGIN.")
  process.exit(1)
}

async function graphql(query, variables) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  })
  const body = await res.json()
  if (!res.ok || body.errors) {
    console.error("GraphQL request failed:", JSON.stringify(body.errors ?? body))
    process.exit(1)
  }
  return body.data
}

const CALENDAR = `query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar { weeks { contributionDays { date contributionCount } } }
    }
  }
}`

async function activeDays(from, to) {
  const data = await graphql(CALENDAR, { login, from: `${from}T00:00:00Z`, to: `${to}T23:59:59Z` })
  return data.user.contributionsCollection.contributionCalendar.weeks
    .flatMap((w) => w.contributionDays)
    .filter((d) => d.contributionCount > 0 && d.date >= from && d.date <= to)
    .map((d) => ({ date: d.date, count: d.contributionCount }))
}

const now = new Date()
const today = now.toISOString().slice(0, 10)
const yearAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 364))
  .toISOString()
  .slice(0, 10)

const { user } = await graphql(
  `query($login: String!) { user(login: $login) { contributionsCollection { contributionYears } } }`,
  { login },
)
const years = user.contributionsCollection.contributionYears.slice().sort((a, b) => b - a)

const out = { updated: today, last: await activeDays(yearAgo, today), years: {} }
for (const year of years) {
  const end = year === now.getUTCFullYear() ? today : `${year}-12-31`
  out.years[year] = await activeDays(`${year}-01-01`, end)
}

await mkdir("data", { recursive: true })
await writeFile("data/contributions.json", JSON.stringify(out) + "\n")
const sum = (days) => days.reduce((s, d) => s + d.count, 0)
console.log(
  `Updated ${today}. Last 12 months: ${sum(out.last)}. ` +
    years.map((y) => `${y}: ${sum(out.years[y])}`).join(", "),
)
