## Context

The application needs a way to manage catalog items in production without requiring developers to manually sync database tables between environments. We are adopting "Architecture B": a single-environment CMS where the production database is the single source of truth, and visibility is controlled via a `status` field (`draft`, `published`, `archived`) on `catalogItems`.

## Goals / Non-Goals

**Goals:**

- Implement a CMS interface for managing catalog items within the main application.
- Introduce `status` (`draft`, `published`, `archived`) to `catalogItems` schema to toggle visibility.
- Ensure public-facing views only fetch `published` items.
- Implement an atomic archiving strategy that tags associated `listItems` as `archived` to prevent broken UI references for users who own those items.
- Secure CMS routes and Convex mutations with proper authorization checks.

**Non-Goals:**

- Multi-environment data synchronization (e.g., pushing from a staging Convex instance to production).
- Complex multi-step review or approval workflows for publishing.

## Decisions

1. **Single-Environment Architecture (Architecture B):**
   _Rationale:_ Eliminates the need for complex data synchronization scripts, missing reference IDs, or merge conflicts between databases. The database is the CMS.
   _Alternatives Considered:_ Multi-environment syncing (Architecture A) was rejected due to sync logic complexity (e.g., handling deleted items, ID conflicts).

2. **Archiving vs. Deleting:**
   _Rationale:_ If a catalog item is deleted, every user's `listItem` pointing to it would break the UI (e.g., trying to join a non-existent name/image). By changing the status to `archived` and adding an `"archived"` tag to referencing `listItems`, we maintain relational integrity and provide context to the user.
   _Alternatives Considered:_ Deleting items and cascading deletes to user lists (rejected because users lose their data), or leaving broken references (rejected due to poor UX/UI crashes).

3. **Public Query Optimization:**
   _Rationale:_ A new Convex index `by_type_status` (`['type', 'status']`) will be added to ensure public queries can efficiently filter for `published` items without table scans.

4. **Authorization Strategy:**
   _Rationale:_ CMS routes and corresponding mutations must check that the requesting user's `ownerSubject` (via Clerk) has administrative privileges. This can be handled by an `admins` table in Convex or custom Clerk claims.

## Risks / Trade-offs

- **[Risk] Accidental changes to live data:** Because the CMS operates on the production database, bad edits are live immediately if published.
  _Mitigation:_ Items default to `draft`. Proper UI confirmations for the `archive` and `publish` actions.

- **[Risk] Performance hit when archiving heavily referenced items:** The archiving mutation has to query and update multiple user `listItems`.
  _Mitigation:_ Use an index on `listItems` (`by_catalogItemId`) to efficiently find and patch affected user items. Since Convex handles this as a transaction, it remains atomic.
