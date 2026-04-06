# website-solid

SolidStart 2 alpha app scaffolded for this repo with:

- Tailwind CSS v4
- Effect
- Convex
- Clerk
- solid-ui.com components

## Commands

```bash
bun install
bun run dev
bun run check
bun run build
```

Convex codegen is included, but it needs a configured deployment first:

```bash
bun run convex:gen
```

## Environment

Copy `.env.example` and fill in:

```bash
VITE_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_JWT_ISSUER_DOMAIN=
VITE_CONVEX_URL=
CONVEX_DEPLOYMENT=
```

## Notes

- Clerk is integrated with `@clerk/clerk-js` so the app does not depend on a framework-specific SolidStart SDK.
- Convex is wired with a browser client provider and a sample query in [`convex/dashboard.ts`](./convex/dashboard.ts).
- Server-side stack metadata is loaded through Effect in [`src/lib/server/stack.ts`](./src/lib/server/stack.ts).
