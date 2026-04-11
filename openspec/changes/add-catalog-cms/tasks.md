## 1. Database Schema Updates

- [x] 1.1 Update `catalogItems` schema in `schema.ts` to include a `status` field with literals: `"draft"`, `"published"`, `"archived"`
- [x] 1.2 Add Convex indexes `by_status` and `by_type_status` to `catalogItems` in `schema.ts`
- [x] 1.3 Write a migration script or action to update existing catalog items to have `status: "published"` (or `draft` if appropriate)

## 2. API & Authorization

- [x] 2.1 Implement an authorization utility or middleware in Convex to verify if the requesting user (`ownerSubject`) is an administrator
- [x] 2.2 Update existing public catalog queries (e.g., `getItems.ts`) to strictly filter by `status === "published"`
- [x] 2.3 Create Convex mutations for CMS operations: `createCatalogItem` (draft by default) and `updateCatalogItem`
- [x] 2.4 Create Convex mutation `publishCatalogItem` to change a draft's status to `published`
- [x] 2.5 Create Convex mutation `archiveCatalogItem` that changes status to `archived` and appends an `"archived"` tag to all referencing user `listItems`
- [x] 2.6 Ensure all mutations created in 2.3, 2.4, and 2.5 use the authorization utility from 2.1

## 3. CMS User Interface

- [x] 3.1 Create the base SvelteKit route and layout for `/cms/catalog` ensuring non-admins are blocked/redirected
- [x] 3.2 Build the CMS catalog list view to display all items along with their current status
- [x] 3.3 Implement a form component to create and edit draft catalog items
- [x] 3.4 Add "Publish" action buttons/flows to the CMS catalog list/form
- [x] 3.5 Add "Archive" action buttons/flows with appropriate warnings/confirmations to the CMS catalog list/form
