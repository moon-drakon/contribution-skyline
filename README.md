# Contribution Skyline

My GitHub contributions, year by year, as a heat map and an interactive 3D skyline.

**Live:** https://moon-drakon.github.io/contribution-skyline/

## What you can do

- Pick the last 12 months or any year since 2021. A link like `?year=2025` opens that year.
- Switch between the flat heat map and the 3D skyline.
- Hover or tap a day to see its count.
- Drag the skyline to orbit it. Double-click to reset the camera.
- Use the arrow keys to walk the grid, day by day.
- Hover a legend swatch to isolate one activity level.

## How it works

A GitHub Actions workflow runs every day. It fetches the last 12 months and every contribution
year from the GitHub GraphQL API, builds the site as a static export, and deploys it to GitHub Pages.
If the API call fails, the deploy stops and the last good version stays live.

| Part | Technology |
| --- | --- |
| Framework | Next.js 16 (static export), React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui project structure |
| Chart | [Contribution Skyline](https://21st.dev/@kedhareswer/components/contribution-skyline) by kedhareswer, in `components/ui` |
| Data | `scripts/fetch-contributions.mjs`, GitHub GraphQL API |
| Hosting | GitHub Pages, deployed by `.github/workflows/deploy.yml` |

## Credits

The chart is the [Contribution Skyline](https://21st.dev/@kedhareswer/components/contribution-skyline)
component by kedhareswer, in `components/ui/contribution-skyline.tsx`. The year picker,
data pipeline, and page are mine.

## Run locally

Requires Node.js 22.

```bash
npm install
GITHUB_TOKEN=your_token GH_LOGIN=your_username node scripts/fetch-contributions.mjs
npm run dev
```

Open http://localhost:3000/contribution-skyline/.

`data/contributions.json` holds empty data in the repository. The workflow fills it
before each build, so the deployed site always shows current data.
