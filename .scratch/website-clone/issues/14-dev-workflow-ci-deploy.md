# Dev workflow, CI, and deployment config

Type: grilling
Status: open
Blocked by: 05, 18

## Question

With the framework locked (issue 05), the platform chosen (issue 18), and images in
`public/`, decide the day-to-day mechanics:

- Local dev: env var layout (`DATABASE_URL` pooled + unpooled, Clerk keys,
  `IMAGE_BASE_URL`), whether devs use Neon branch databases or a shared dev branch,
  `.env` conventions.
- Root wiring: `dev:website` / `build:website` / `lint:website` /
  `typecheck:website` scripts in the root package.json, matching the existing
  per-app pattern; oxlint/oxfmt coverage for `apps/website`.
- CI: extend the existing GitHub workflow(s) to lint/typecheck the new app.
- Vercel service config (per issue 18): Git-integration deploys **only** — local
  `vercel deploy` is forbidden (the CLI's 100MB source-upload cap vs the ~98MB
  `public/diddls/`, per issue 07); build command from repo root
  (`bun run --filter website build`), root-directory/ignored-build settings for the
  monorepo, env vars, drizzle-kit migration step (run against the unpooled string —
  when/how: manually, or pre-deploy).
- Logging/observability: what replaces the desktop logging module — platform stdout
  logs likely suffice; decide and record.
