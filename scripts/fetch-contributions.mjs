// Writes data/contributions.json: the profile shown in the header and footer, the
// rolling last 12 months, and every calendar year that has contributions. Only days
// with a count above zero are stored; the chart treats missing days as zero.
//
//   GITHUB_TOKEN=... GH_LOGIN=your-username node scripts/fetch-contributions.mjs
//
// Optional: DISPLAY_NAME overrides the profile name. EXTRA_LINKS adds footer links,
// one per line as "Label URL". GITHUB_REPOSITORY (set by Actions) adds the Source link.
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

async function rest(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `bearer ${token}`, Accept: "application/vnd.github+json" },
  })
  if (!res.ok) {
    console.error(`GET ${path} failed: ${res.status} ${await res.text()}`)
    process.exit(1)
  }
  return res.json()
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

const PROVIDERS = {
  bluesky: "Bluesky",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  mastodon: "Mastodon",
  npm: "npm",
  reddit: "Reddit",
  twitch: "Twitch",
  twitter: "X",
  youtube: "YouTube",
}

/** "Label URL" per line. The URL is the last word, so a label can contain spaces. */
function parseExtraLinks(text) {
  const links = []
  for (const line of (text ?? "").split("\n").map((l) => l.trim()).filter(Boolean)) {
    const at = line.lastIndexOf(" ")
    const label = line.slice(0, at).trim()
    const href = line.slice(at + 1)
    if (at < 1 || !/^(https?:\/\/|mailto:)/.test(href)) {
      console.warn(`Skipped EXTRA_LINKS line, expected "Label URL": ${line}`)
      continue
    }
    links.push({ label, href })
  }
  return links
}

async function profile() {
  const user = await rest(`/users/${login}`)
  const socials = await rest(`/users/${login}/social_accounts`)
  const links = [{ label: "GitHub", href: user.html_url }]
  if (user.blog) links.push({ label: "Website", href: /^https?:\/\//.test(user.blog) ? user.blog : `https://${user.blog}` })
  for (const s of socials) {
    links.push({ label: PROVIDERS[s.provider] ?? new URL(s.url).hostname.replace(/^www\./, ""), href: s.url })
  }
  if (user.email) links.push({ label: "Email", href: `mailto:${user.email}` })
  links.push(...parseExtraLinks(process.env.EXTRA_LINKS))

  const seen = new Set()
  return {
    login: user.login,
    name: process.env.DISPLAY_NAME?.trim() || user.name || user.login,
    links: links.filter((l) => !seen.has(l.href) && seen.add(l.href)),
  }
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

const out = {
  updated: today,
  profile: await profile(),
  repo: process.env.GITHUB_REPOSITORY || null,
  last: await activeDays(yearAgo, today),
  years: {},
}
for (const year of years) {
  const end = year === now.getUTCFullYear() ? today : `${year}-12-31`
  out.years[year] = await activeDays(`${year}-01-01`, end)
}

await mkdir("data", { recursive: true })
await writeFile("data/contributions.json", JSON.stringify(out) + "\n")
const sum = (days) => days.reduce((s, d) => s + d.count, 0)
console.log(
  `Updated ${today} for ${out.profile.name} (${out.profile.links.length} links). Last 12 months: ${sum(out.last)}. ` +
    years.map((y) => `${y}: ${sum(out.years[y])}`).join(", "),
)
