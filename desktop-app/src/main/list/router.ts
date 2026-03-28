import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { addListItemSchema, listItemFilterSchema } from "../../shared";
import { logging } from "../logging";
import { publicProcedure, router } from "../trpc/trpc";

export const listRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const lists = await ctx.db
        .selectFrom("list")
        .selectAll()
        .where("deletedAt", "is", null)
        .execute();

      if (lists.length === 0) logging.warn("no lists found");

      return lists;
    } catch (e) {
      logging.error(e);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch lists" });
    }
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        diddlIds: z.array(z.number()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.transaction().execute(async (trx) => {
          const newList = await trx
            .insertInto("list")
            .values({
              name: input.name,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
            .returningAll()
            .executeTakeFirstOrThrow();

          if (input.diddlIds.length > 0) {
            const listItems = input.diddlIds.map((id) => ({
              listId: newList.id,
              diddlId: id,
              quantity: 1,
              isDamaged: false,
              isIncomplete: false,
            }));
            await trx.insertInto("listItem").values(listItems).execute();
          }

          return newList;
        });
      } catch (e) {
        logging.error(e);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create list" });
      }
    }),

  delete: publicProcedure
    .input(z.object({ listId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .updateTable("list")
          .set({ deletedAt: new Date().toISOString() })
          .where("id", "=", input.listId)
          .execute();
      } catch (e) {
        logging.error(e);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete list" });
      }
    }),

  updateName: publicProcedure
    .input(z.object({ listId: z.number(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .updateTable("list")
          .set({ name: input.name, updatedAt: new Date().toISOString() })
          .where("id", "=", input.listId)
          .execute();
      } catch (e) {
        logging.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update list name",
        });
      }
    }),

  items: publicProcedure
    .input(z.object({ listId: z.number(), filters: listItemFilterSchema.optional() }))
    .query(async ({ ctx, input }) => {
      try {
        const list = await ctx.db
          .selectFrom("list")
          .selectAll()
          .where("id", "=", input.listId)
          .where("deletedAt", "is", null)
          .executeTakeFirst();

        if (!list) {
          throw new TRPCError({ code: "NOT_FOUND", message: "List not found" });
        }

        let query = ctx.db
          .selectFrom("listItem")
          .innerJoin("diddl", "diddl.id", "listItem.diddlId")
          .select([
            "listItem.id as listItemId",
            "listItem.listId",
            "listItem.diddlId",
            "listItem.quantity",
            "listItem.isDamaged",
            "listItem.isIncomplete",
            "diddl.name as diddlName",
            "diddl.type as diddlType",
            "diddl.imagePath",
            "diddl.imageWidth",
            "diddl.imageHeight",
          ])
          .orderBy("diddlId", "asc")

          .where("listItem.listId", "=", input.listId);

        const filters = input.filters;
        if (filters) {
          if (filters.type !== undefined) {
            query = query.where("diddl.type", "=", filters.type);
          }
          if (filters.isDamaged !== undefined) {
            query = query.where("listItem.isDamaged", "=", filters.isDamaged);
          }
          if (filters.isIncomplete !== undefined) {
            query = query.where("listItem.isIncomplete", "=", filters.isIncomplete);
          }
          if (filters.minCount !== undefined) {
            query = query.where("listItem.quantity", ">=", filters.minCount);
          }
          if (filters.maxCount !== undefined) {
            query = query.where("listItem.quantity", "<=", filters.maxCount);
          }
        }

        const items = await query.execute();

        return items;
      } catch (e) {
        if (e instanceof TRPCError) throw e;
        logging.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch list details",
        });
      }
    }),

  addItems: publicProcedure
    .input(
      z.object({
        listId: z.number(),
        items: addListItemSchema.array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .insertInto("listItem")
          .values(input.items.map((item) => ({ listId: input.listId, ...item })))
          .execute();

        return { success: true as const };
      } catch (e) {
        logging.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add list items",
        });
      }
    }),

  removeItems: publicProcedure
    .input(z.object({ listId: z.number(), listItemIds: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .deleteFrom("listItem")
          .where("listId", "=", input.listId)
          .where("id", "in", input.listItemIds)
          .execute();

        return { success: true as const };
      } catch (e) {
        logging.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove list items",
        });
      }
    }),

  duplicateItem: publicProcedure
    .input(z.object({ listItemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const sourceItem = await ctx.db
          .selectFrom("listItem")
          .selectAll()
          .where("id", "=", input.listItemId)
          .executeTakeFirst();

        if (!sourceItem) {
          throw new TRPCError({ code: "NOT_FOUND", message: "List item not found" });
        }

        await ctx.db
          .insertInto("listItem")
          .values({
            listId: sourceItem.listId,
            diddlId: sourceItem.diddlId,
            quantity: 1,
            isDamaged: sourceItem.isDamaged,
            isIncomplete: sourceItem.isIncomplete,
          })
          .execute();

        return { success: true as const };
      } catch (e) {
        if (e instanceof TRPCError) throw e;
        logging.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to duplicate list item",
        });
      }
    }),

  updateItems: publicProcedure
    .input(
      z.object({
        listId: z.number(),
        listItemIds: z.array(z.number()),
        action: z.object({
          addQuantity: z.number().optional(),
          isDamaged: z.boolean().optional(),
          isIncomplete: z.boolean().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { addQuantity, isDamaged, isIncomplete } = input.action;

        const updateResult = await ctx.db.transaction().execute(async (trx) => {
          const results = await trx
            .updateTable("listItem")
            .set((eb) => ({
              quantity:
                addQuantity === undefined ? eb.ref("quantity") : eb("quantity", "+", addQuantity),
              isDamaged: isDamaged ?? eb.ref("isDamaged"),
              isIncomplete: isIncomplete ?? eb.ref("isIncomplete"),
            }))
            .returning(["id", "quantity"])
            .where("listId", "=", input.listId)
            .where("id", "in", input.listItemIds)
            .execute();

          const idsToDelete = results.filter((row) => row.quantity <= 0).map((row) => row.id);

          if (idsToDelete.length > 0) {
            await trx
              .deleteFrom("listItem")
              .where("listId", "=", input.listId)
              .where("id", "in", idsToDelete)
              .execute();
          }

          return { numUpdatedRows: results.length, numDeletedRows: idsToDelete.length };
        });

        return { success: true as const, data: updateResult };
      } catch (e) {
        logging.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update list items",
        });
      }
    }),
});
