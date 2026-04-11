import { v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { internalMutation, internalQuery } from "../_generated/server";
import { authedAction } from "./helpers";

const conditionValidator = v.union(
  v.literal("mint"),
  v.literal("near_mint"),
  v.literal("good"),
  v.literal("poor"),
  v.literal("damaged"),
);

const guestListValidator = v.object({
  id: v.string(),
  name: v.string(),
  color: v.string(),
});

const guestItemValidator = v.object({
  listId: v.string(),
  type: v.string(),
  number: v.number(),
  condition: conditionValidator,
  quantity: v.number(),
  complete: v.boolean(),
  tags: v.array(v.string()),
});

export const migrateGuestData = authedAction({
  args: {
    guestSessionId: v.string(),
    lists: v.array(guestListValidator),
    items: v.array(guestItemValidator),
  },
  handler: async (ctx, args) => {
    // Idempotency check: query migrations table for existing record
    const existing = await ctx.runQuery(
      makeFunctionReference<"query">("authed/migration:checkMigration"),
      {
        ownerSubject: ctx.identity.subject,
        guestSessionId: args.guestSessionId,
      },
    );

    if (existing) {
      return {
        status: "already_migrated" as const,
        listsCreated: 0,
        itemsCreated: 0,
        itemsSkipped: 0,
      };
    }

    // Delegate to internal mutation for transactional writes
    const result = await ctx.runMutation(
      makeFunctionReference<"mutation">("authed/migration:executeMigration"),
      {
        ownerSubject: ctx.identity.subject,
        guestSessionId: args.guestSessionId,
        lists: args.lists,
        items: args.items,
      },
    );

    return result;
  },
});

export const checkMigration = internalQuery({
  args: {
    ownerSubject: v.string(),
    guestSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("migrations")
      .withIndex("by_owner_session", (q) =>
        q.eq("ownerSubject", args.ownerSubject).eq("guestSessionId", args.guestSessionId),
      )
      .unique();

    return existing !== null;
  },
});

export const executeMigration = internalMutation({
  args: {
    ownerSubject: v.string(),
    guestSessionId: v.string(),
    lists: v.array(guestListValidator),
    items: v.array(guestItemValidator),
  },
  handler: async (ctx, args) => {
    let listsCreated = 0;
    let itemsCreated = 0;
    let itemsSkipped = 0;

    // Check existing list count for this owner
    const existingLists = await ctx.db
      .query("lists")
      .withIndex("by_owner", (q) => q.eq("ownerSubject", args.ownerSubject))
      .collect();

    const listCap = 3;
    const slotsAvailable = Math.max(0, listCap - existingLists.length);

    // Build map: guestListId -> convexListId
    const listIdMap = new Map<string, (typeof existingLists)[0]["_id"]>();

    for (const guestList of args.lists.slice(0, slotsAvailable)) {
      const convexListId = await ctx.db.insert("lists", {
        name: guestList.name,
        color: guestList.color,
        ownerSubject: args.ownerSubject,
      });
      listIdMap.set(guestList.id, convexListId);
      listsCreated++;
    }

    // Process items
    for (const item of args.items) {
      // Check if the guest list was migrated
      const convexListId = listIdMap.get(item.listId);
      if (convexListId === undefined) {
        itemsSkipped++;
        continue;
      }

      // Resolve type:number to catalogItemId
      const catalogItem = await ctx.db
        .query("catalogItems")
        .withIndex("by_type_number", (q) => q.eq("type", item.type).eq("number", item.number))
        .unique();

      if (catalogItem === null) {
        // Graceful skip for unresolvable catalog references (Pitfall 3)
        itemsSkipped++;
        continue;
      }

      // Deduplication check via by_list_catalog index (D-08)
      const existingItem = await ctx.db
        .query("listItems")
        .withIndex("by_list_catalog", (q) =>
          q.eq("listId", convexListId).eq("catalogItemId", catalogItem._id),
        )
        .unique();

      if (existingItem !== null) {
        itemsSkipped++;
        continue;
      }

      // Insert the list item
      await ctx.db.insert("listItems", {
        listId: convexListId,
        catalogItemId: catalogItem._id,
        condition: item.condition,
        quantity: item.quantity,
        complete: item.complete,
        tags: item.tags,
      });
      itemsCreated++;
    }

    // Record the migration for idempotency
    await ctx.db.insert("migrations", {
      ownerSubject: args.ownerSubject,
      guestSessionId: args.guestSessionId,
      migratedAt: Date.now(),
      listsCreated,
      itemsCreated,
      itemsSkipped,
    });

    return {
      status: "migrated" as const,
      listsCreated,
      itemsCreated,
      itemsSkipped,
    };
  },
});
