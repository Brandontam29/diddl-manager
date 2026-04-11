import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

// Internal mutation — called only from seedCatalogChunk action
// Upserts by type+number: updates name/imagePath if exists, inserts if not
export const insertCatalogChunk = internalMutation({
  args: {
    items: v.array(
      v.object({
        type: v.string(),
        number: v.number(),
        name: v.optional(v.string()),
        imagePath: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;
    for (const item of args.items) {
      const existing = await ctx.db
        .query("catalogItems")
        .withIndex("by_type_number", (q) => q.eq("type", item.type).eq("number", item.number))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, {
          name: item.name,
          imagePath: item.imagePath,
        });
        updated++;
      } else {
        await ctx.db.insert("catalogItems", {
          type: item.type,
          number: item.number,
          name: item.name,
          imagePath: item.imagePath,
          imageStorageIds: [],
          status: "published",
        });
        inserted++;
      }
    }
    return { inserted, updated };
  },
});

// Internal mutation for seeding diddlTypes table
// Upserts by slug: updates displayName/sortOrder if exists, inserts if not
export const insertDiddlTypes = internalMutation({
  args: {
    types: v.array(
      v.object({
        slug: v.string(),
        displayName: v.string(),
        sortOrder: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;
    for (const diddlType of args.types) {
      const existing = await ctx.db
        .query("diddlTypes")
        .withIndex("by_slug", (q) => q.eq("slug", diddlType.slug))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, {
          displayName: diddlType.displayName,
          sortOrder: diddlType.sortOrder,
        });
        updated++;
      } else {
        await ctx.db.insert("diddlTypes", {
          slug: diddlType.slug,
          displayName: diddlType.displayName,
          sortOrder: diddlType.sortOrder,
        });
        inserted++;
      }
    }
    return { inserted, updated };
  },
});

// Link a storage ID to a catalog item's imageStorageIds array
export const linkImageToItem = internalMutation({
  args: {
    type: v.string(),
    number: v.number(),
    storageId: v.id("_storage"),
  },
  handler: async (
    ctx,
    args: { type: string; number: number; storageId: Id<"_storage"> },
  ): Promise<{ status: "linked" | "not_found" }> => {
    const item = await ctx.db
      .query("catalogItems")
      .withIndex("by_type_number", (q) => q.eq("type", args.type).eq("number", args.number))
      .unique();
    if (!item) return { status: "not_found" };
    await ctx.db.patch(item._id, {
      imageStorageIds: [...item.imageStorageIds, args.storageId],
    });
    return { status: "linked" };
  },
});
