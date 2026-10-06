// Writes data/contributions.json: one { date, count } entry per day for the last year.
//
//   GITHUB_TOKEN=... GH_LOGIN=moon-drakon node scripts/fetch-contributions.mjs
//
// The deploy workflow runs this before each build. The window is pinned to whole
// UTC days, and GitHub caps one query at a year, so it covers today and the
// 364 days before it.
import { mkdir, writeFile } from "node:fs/promises"

const token = process.env.GITHUB_TOKEN
const login = process.env.GH_LOGIN
if (!token || !login) {
  console.error("Set GITHUB_TOKEN and GH_LOGIN.")
  process.exit(1)
}

const today = new Date()
const end = today.toISOString().slice(0, 10)
const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 364))
  .toISOString()
  .slice(0, 10)

const query = `query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar { weeks { contributionDays { date contributionCount } } }
    }
  }
}`

const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query, variables: { login, from: `${start}T00:00:00Z`, to: `${end}T23:59:59Z` } }),
})
const body = await res.json()
if (!res.ok || body.errors) {
  console.error("GraphQL request failed:", JSON.stringify(body.errors ?? body))
  process.exit(1)
}

const days = body.data.user.contributionsCollection.contributionCalendar.weeks
  .flatMap((w) => w.contributionDays)
  .map((d) => ({ date: d.date, count: d.contributionCount }))

await mkdir("data", { recursive: true })
await writeFile("data/contributions.json", JSON.stringify(days) + "\n")
console.log(`Wrote ${days.length} days, ${days.reduce((s, d) => s + d.count, 0)} contributions, ending ${end}.`)
