## Why

Currently, there is no way to manage the catalog items natively within the application. A CMS is needed to allow administrators to add, edit, publish, and archive catalog items safely, using a single-environment database architecture (Architecture B) where the database acts as the source of truth with visibility states.

## What Changes

- Add a `status` field to the `catalogItems` schema with states: `draft`, `published`, and `archived`.
- Ensure all public-facing queries filter catalog items to only show `published` ones.
- Create an admin-only UI (CMS) to view and manage all catalog items regardless of status.
- Implement an `archiveCatalogItem` mutation that changes an item's status to `archived` and atomically appends an `archived` tag to any user `listItems` that reference the archived catalog item.
- Implement authorization checks to ensure only admins can perform CMS actions.

## Capabilities

### New Capabilities
- `catalog-cms`: The ability for administrators to manage catalog items through a dedicated UI, including draft states and archiving without breaking existing user lists.

### Modified Capabilities
- (None)

## Impact

- **Database:** `catalogItems` schema will be updated to require a `status` field.
- **API:** Existing public queries must be updated to filter out non-published items.
- **UI:** A new restricted admin route will be added (`/cms/catalog` or similar) with forms to manage the data.
- **User Data:** User `listItems` will automatically receive an `archived` tag if a referenced catalog item is archived, preventing broken references and informing the user.