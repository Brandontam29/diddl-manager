import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  catalogItems: defineTable({
    type: v.string(), // "A4", "sticker", etc. — matches diddlTypes.slug
    number: v.number(), // sequential integer extracted from filename
    name: v.optional(v.string()), // human-readable display name
    edition: v.optional(v.string()), // optional — not present in catalog.json
    releaseDate: v.optional(v.number()), // optional — epoch ms; not in catalog.json
    imageStorageIds: v.array(v.id("_storage")), // DATA-07: array, future-ready
    imagePath: v.optional(v.string()), // raw path from catalog.json for reference
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
  })
    .index("by_type_number", ["type", "number"]) // DATA-06: MUST exist before any catalog query
    .index("by_status", ["status"])
    .index("by_type_status", ["type", "status"]),

  diddlTypes: defineTable({
    // DATA-05: managed collection, not hardcoded enum
    slug: v.string(), // "A4", "sticker", etc. — matches catalogItems.type
    displayName: v.string(), // "A4 Sheets", "Stickers", etc.
    sortOrder: v.number(), // controls sidebar display order
  })
    .index("by_slug", ["slug"])
    .index("by_sort_order", ["sortOrder"]),

  lists: defineTable({
    // DATA-02: declared now, used in Phase 2
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    ownerSubject: v.string(), // Clerk identity.subject — NOT email
  }).index("by_owner", ["ownerSubject"]),

  listItems: defineTable({
    // DATA-03: declared now, used in Phase 2
    listId: v.id("lists"),
    catalogItemId: v.id("catalogItems"),
    condition: v.union(
      v.literal("mint"),
      v.literal("near_mint"),
      v.literal("good"),
      v.literal("poor"),
      v.literal("damaged"),
    ),
    quantity: v.number(),
    complete: v.boolean(),
    tags: v.array(v.string()),
  })
    .index("by_list", ["listId"])
    .index("by_list_catalog", ["listId", "catalogItemId"])
    .index("by_catalogItemId", ["catalogItemId"]),

  migrationCompletions: defineTable({
    ownerSubject: v.string(),
    guestSessionId: v.string(),
    migratedAt: v.number(),
  }).index("by_owner_guest_session", ["ownerSubject", "guestSessionId"]),

  migrations: defineTable({
    ownerSubject: v.string(),
    guestSessionId: v.string(),
    migratedAt: v.number(), // epoch ms
    listsCreated: v.number(),
    itemsCreated: v.number(),
    itemsSkipped: v.number(),
  }).index("by_owner_session", ["ownerSubject", "guestSessionId"]),

  userProfiles: defineTable({
    // DATA-04: declared now, used in Phase 4
    ownerSubject: v.string(),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    hobbies: v.array(v.string()),
    pictureStorageId: v.optional(v.id("_storage")),
  }).index("by_owner", ["ownerSubject"]),
});
