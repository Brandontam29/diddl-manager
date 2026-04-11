# Phase 3: Auth + Migration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-03
**Phase:** 03-auth-migration
**Areas discussed:** Sign-in UI placement, Store switching experience, Migration feedback UX, Guest vs authed navigation

---

## Sign-in UI Placement

| Option                      | Description                                                                              | Selected |
| --------------------------- | ---------------------------------------------------------------------------------------- | -------- |
| Header button + Clerk modal | A 'Sign in' button in the app header that opens Clerk's built-in modal. Minimal routing. | ✓        |
| Dedicated /login page       | A standalone route with Clerk's SignIn/SignUp components centered on the page.           |          |
| Inline on landing page      | Sign-in form embedded directly on the landing page alongside a pitch.                    |          |

**User's choice:** Header button + Clerk modal
**Notes:** Keeps UI minimal, no extra routing needed.

### Auth Providers

| Option           | Description                                | Selected |
| ---------------- | ------------------------------------------ | -------- |
| Email + password | Standard email/password sign-up and login. | ✓        |
| Google OAuth     | Sign in with Google.                       | ✓        |
| GitHub OAuth     | Sign in with GitHub.                       |          |
| Email magic link | Passwordless email link.                   |          |

**User's choice:** Email + password and Google OAuth

### Sign-out Behavior

| Option                   | Description                                                       | Selected |
| ------------------------ | ----------------------------------------------------------------- | -------- |
| Stay on page as guest    | User stays where they are, store switches back to GuestListStore. |          |
| Redirect to home/landing | Navigate to / or /app root after sign-out.                        | ✓        |

**User's choice:** Redirect to home/landing

### Landing Page

| Option                   | Description                                                              | Selected |
| ------------------------ | ------------------------------------------------------------------------ | -------- |
| Landing page with pitch  | Simple page at / with description, 'Try as Guest' and 'Sign In' buttons. | ✓        |
| Skip landing, go to /app | / redirects to /app immediately.                                         |          |

**User's choice:** Landing page with pitch

### Clerk Theme

| Option              | Description                                                | Selected |
| ------------------- | ---------------------------------------------------------- | -------- |
| Themed to match app | Customize Clerk's appearance with stone/dark theme colors. | ✓        |
| Clerk defaults      | Use Clerk's built-in light theme.                          |          |

**User's choice:** Themed to match app

---

## Store Switching Experience

| Option                         | Description                                                          | Selected |
| ------------------------------ | -------------------------------------------------------------------- | -------- |
| Seamless swap in place         | Store switches on same page with brief loading shimmer. No redirect. | ✓        |
| Redirect to /app after sign-in | Redirect to /app root, app re-initializes with ConvexListStore.      |          |
| Full page reload               | Full reload after sign-in, everything re-initializes.                |          |

**User's choice:** Seamless swap in place

### Migration Confirmation

| Option                   | Description                                                | Selected |
| ------------------------ | ---------------------------------------------------------- | -------- |
| Auto-migrate silently    | Guest data migrates automatically. No confirmation dialog. | ✓        |
| Confirm before migrating | Show dialog asking user to accept or discard guest data.   |          |

**User's choice:** Auto-migrate silently

### Conflict Handling

| Option                        | Description                                              | Selected |
| ----------------------------- | -------------------------------------------------------- | -------- |
| Merge guest list into account | Guest list added as additional list, items deduplicated. | ✓        |
| Discard guest data            | Ignore guest data if user already has Convex lists.      |          |
| Ask the user                  | Show dialog asking user to import or discard.            |          |

**User's choice:** Merge guest list into account

---

## Migration Feedback UX

| Option                          | Description                                                   | Selected |
| ------------------------------- | ------------------------------------------------------------- | -------- |
| Loading shimmer + success toast | Brief shimmer while migrating, then toast "Collection saved." | ✓        |
| Silent background sync          | No visible loading state, data appears via reactive queries.  |          |
| Full-screen loading             | Full overlay blocking interaction until complete.             |          |

**User's choice:** Loading shimmer + success toast

### Failure Handling

| Option                     | Description                                                                     | Selected |
| -------------------------- | ------------------------------------------------------------------------------- | -------- |
| Error toast + auto-retry   | Error toast with auto-retry up to 3 times with backoff. localStorage preserved. | ✓        |
| Error toast + manual retry | Error toast with manual Retry button.                                           |          |

**User's choice:** Error toast + auto-retry (3 attempts with backoff)

---

## Guest vs Authed Navigation

### Header Treatment

| Option                            | Description                                                                 | Selected |
| --------------------------------- | --------------------------------------------------------------------------- | -------- |
| Sign In button → User avatar menu | Guests see Sign In; authed users see Clerk UserButton avatar with dropdown. | ✓        |
| Same header + banner prompt       | Same header for both, guests see dismissible upgrade banner.                |          |

**User's choice:** Sign In button → User avatar menu

### Upgrade Prompts

| Option                    | Description                                                                     | Selected |
| ------------------------- | ------------------------------------------------------------------------------- | -------- |
| Subtle contextual prompts | Prompts at friction points (2nd list attempt, lists page footer). Non-blocking. | ✓        |
| No extra prompts          | Only header Sign In button. Clean guest experience.                             |          |
| Persistent top banner     | Sticky banner for guests. Always visible.                                       |          |

**User's choice:** Subtle contextual prompts

### Nav Structure

| Option                        | Description                                             | Selected |
| ----------------------------- | ------------------------------------------------------- | -------- |
| Same nav, lists limit differs | Both see Catalog + Lists. Profile link only for authed. | ✓        |
| Authed users get extra nav    | Additional nav items for authed users.                  |          |

**User's choice:** Same nav, lists limit differs

### Authed List Limit

| Option              | Description                        | Selected |
| ------------------- | ---------------------------------- | -------- |
| Unlimited lists     | No cap for signed-in users.        |          |
| Soft cap (e.g., 25) | Reasonable limit to prevent abuse. |          |
| Custom: 3 lists     | User specified 3 as the limit.     | ✓        |

**User's choice:** 3 lists (user-specified)

### Completion Percentage Visibility

| Option                 | Description                                      | Selected |
| ---------------------- | ------------------------------------------------ | -------- |
| Both guests and authed | Guests see completion for their 1 list.          |          |
| Authed only            | Completion percentages gated to signed-in users. | ✓        |

**User's choice:** Authed only — sign-up incentive

---

## Claude's Discretion

- Loading shimmer component design and animation
- Exact toast message wording
- Retry backoff timing
- Landing page layout and copy
- Clerk theme color mapping specifics

## Deferred Ideas

None — discussion stayed within phase scope
