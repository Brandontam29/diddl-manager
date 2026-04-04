# Technology Stack

**Analysis Date:** 2026-04-02

## Languages

**Primary:**

- TypeScript 5.9.3 - Full codebase including frontend components, Svelte files, and backend functions

**Secondary:**

- JavaScript - Build configuration and linting setup files

## Runtime

**Environment:**

- Node.js (via Bun or standard Node.js environments)

**Package Manager:**

- Bun - Primary package manager for the project
- Lockfile: Present (managed via Bun)

## Frameworks

**Core:**

- SvelteKit 2.50.2 - Full-stack web framework
- Svelte 5.51.0 - UI component framework with runes support
- Vite 7.3.1 - Build tool and dev server

**Backend/Database:**

- Convex 1.33.0 - Backend platform providing real-time database and serverless functions
- Effect 4.0.0-beta.31 - Functional effect system for type-safe backend code
- @effect/platform-node 4.0.0-beta.31 - Node.js platform layer for Effect

**Authentication:**

- Clerk 6.3.0 (@clerk/clerk-js, @clerk/ui, @clerk/backend) - Authentication and user management
  - Integrated with Convex via JWT token provider

**Styling:**

- TailwindCSS 4.1.18 - Utility-first CSS framework
- @tailwindcss/vite 4.1.18 - Vite plugin for TailwindCSS
- @tailwindcss/typography 0.5.19 - Typography plugin for styled content

**Testing & Development:**

- Svelte-check 4.4.2 - Svelte component type checking
- SvelteKit sync utilities - Type generation for routes and configuration

## Key Dependencies

**Critical:**

- convex-helpers 0.1.114 - Utilities for custom function wrappers and authentication patterns
- convex-svelte 0.0.12 - Svelte integration for Convex client
- convex-vite-plugin 0.4.0 - Vite plugin for local Convex development

**Code Quality:**

- ESLint 9.39.2 - JavaScript/TypeScript linting
- eslint-config-prettier 10.1.8 - Disables ESLint rules that conflict with Prettier
- eslint-plugin-svelte 3.14.0 - ESLint plugin for Svelte files
- typescript-eslint 8.54.0 - TypeScript support for ESLint
- Prettier 3.8.1 - Code formatter
- prettier-plugin-svelte 3.4.1 - Svelte support for Prettier
- prettier-plugin-tailwindcss 0.7.2 - TailwindCSS class sorting in Prettier

**Deployment:**

- @sveltejs/adapter-vercel 6.3.1 - Vercel adapter for SvelteKit production builds

**Utilities:**

- vite-plugin-devtools-json 1.0.0 - Development tools integration

## Configuration

**Environment:**

- Environment variables loaded from `.env` files (see `.env.example`)
- Required variables:
  - `CONVEX_DEPLOYMENT` - Convex project deployment ID
  - `PUBLIC_CONVEX_URL` - Convex HTTP endpoint for production
  - `PUBLIC_CONVEX_SITE_URL` - Convex site proxy URL for production
  - `CONVEX_PRIVATE_BRIDGE_KEY` - Secret key for backend-to-Convex communication
  - `CLERK_JWT_ISSUER_DOMAIN` - Clerk JWT issuer for Convex auth
  - `PUBLIC_CLERK_PUBLISHABLE_KEY` - Public Clerk key for frontend
  - `CLERK_SECRET_KEY` - Secret Clerk key for backend operations
- Local development uses `USE_LOCAL_CONVEX=true` to run Convex locally on port 3210
- Optional `RESET_LOCAL_BACKEND=true` to reset local Convex database on startup

**Build:**

- `vite.config.ts` - Vite configuration with Tailwind, SvelteKit, and Convex local plugin support
- `svelte.config.js` - SvelteKit configuration using Vercel adapter with experimental remote functions
- `tsconfig.json` - TypeScript compiler options with strict mode enabled
- `eslint.config.js` - ESLint flat config with TypeScript, Svelte, and Prettier support
- `.prettier` configuration inherited from Prettier defaults with Svelte and TailwindCSS plugins

## Platform Requirements

**Development:**

- Bun (primary) or Node.js with npm/yarn (alternative)
- Docker (optional, for running Convex dashboard via `convex:dash` script)
- Git for version control

**Production:**

- Vercel - Deployed using SvelteKit Vercel adapter
- Convex cloud deployment - Backend functions and database
- Clerk cloud instance - User authentication and management

## Build Scripts

```bash
bun run dev              # Start local dev server with local Convex (USE_LOCAL_CONVEX=true)
bun run dev:hosted       # Start dev server using hosted Convex
bun run build            # Production build with Vite
bun run preview          # Preview production build locally
bun run lint             # Run Prettier and ESLint checks
bun run format           # Format code with Prettier
bun run check            # Type check with svelte-kit sync and svelte-check
bun run check:watch      # Watch mode for type checking
bun run convex:gen       # Generate Convex TypeScript API types
bun run convex:dash      # Run Convex dashboard in Docker
```

---

_Stack analysis: 2026-04-02_
