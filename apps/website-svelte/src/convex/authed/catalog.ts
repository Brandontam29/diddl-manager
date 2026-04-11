import { v } from "convex/values";
import { query } from "../_generated/server";

// Use plain query() — NOT authedQuery — so unauthenticated users can browse the catalog
export const listByRange = query({
  args: {
    type: v.string(),
    fromNumber: v.number(),
    toNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("catalogItems")
      .withIndex("by_type_number", (q) =>
        q.eq("type", args.type).gte("number", args.fromNumber).lte("number", args.toNumber),
      )
      .filter((q) => q.eq(q.field("status"), "published"))
      .order("asc")
      .collect();

    // Resolve first image URL server-side; client never calls storage APIs directly
    return await Promise.all(
      items.map(async (item) => {
        const imageUrl =
          item.imageStorageIds.length > 0
            ? await ctx.storage.getUrl(item.imageStorageIds[0])
            : null;
        return { ...item, imageUrl };
      }),
    );
  },
});

// Returns item count per type slug — used by sidebar to derive range rows
// Uses plain query() — no auth required for catalog browsing
export const countByType = query({
  args: {},
  handler: async (ctx) => {
    const types = await ctx.db
      .query("diddlTypes")
      .withIndex("by_sort_order")
      .order("asc")
      .collect();
    return await Promise.all(
      types.map(async (t) => {
        const items = await ctx.db
          .query("catalogItems")
          .withIndex("by_type_number", (q) => q.eq("type", t.slug))
          .filter((q) => q.eq(q.field("status"), "published"))
          .collect();
        return { slug: t.slug, count: items.length };
      }),
    );
  },
});
