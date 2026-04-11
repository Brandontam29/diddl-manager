## ADDED Requirements

### Requirement: Admin UI Access Control

The system MUST restrict access to the catalog CMS to authorized administrators only.

#### Scenario: Unauthorized access attempt

- **WHEN** a regular user or unauthenticated user attempts to access `/cms/catalog` or call a CMS mutation
- **THEN** they receive a 403 Forbidden or are redirected away

#### Scenario: Authorized admin access

- **WHEN** an authenticated administrator accesses `/cms/catalog`
- **THEN** the CMS UI is rendered successfully

### Requirement: Manage Catalog Drafts

The system MUST allow administrators to create and edit catalog items as drafts without affecting the live public website.

#### Scenario: Creating a draft

- **WHEN** an admin creates a new item in the CMS
- **THEN** the item is saved to the database with `status` set to `draft` by default

#### Scenario: Editing an existing item

- **WHEN** an admin edits any catalog item in the CMS
- **THEN** the updates are saved to the database

### Requirement: Publish Catalog Items

The system MUST allow administrators to publish catalog items, making them visible on the public catalog.

#### Scenario: Publishing a draft

- **WHEN** an admin changes a draft item's status to `published`
- **THEN** the item immediately becomes visible to public queries

### Requirement: Archive Catalog Items

The system MUST allow administrators to archive catalog items, hiding them from the public catalog while preserving existing user lists.

#### Scenario: Archiving a published item

- **WHEN** an admin changes an item's status to `archived`
- **THEN** the item is no longer returned by public catalog queries
- **AND THEN** any user `listItems` referencing this catalog item automatically receive an `"archived"` tag

### Requirement: Public Catalog Filtering

The public catalog API MUST only return items that have a `published` status.

#### Scenario: Public user viewing catalog

- **WHEN** a query is made to fetch the catalog for public display
- **THEN** the query filters items using the `by_type_status` index and only returns items where `status === "published"`
