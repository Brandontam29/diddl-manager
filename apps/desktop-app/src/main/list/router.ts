import { TRPCError } from "@trpc/server";
import { sql } from "kysely";
import { z } from "zod";

import { addListItemSchema, listItemFilterSchema, listSectionNameSchema } from "../../shared";
import { logging } from "../logging";
import { publicProcedure, router } from "../trpc/trpc";

const LIST_COLORS = [
  "oklch(77.2% 0.142 5.8)",
  "oklch(82.7% 0.125 65.4)",
  "oklch(91.2% 0.187 101.3)",
  "oklch(86.3% 0.190 123.6)",
  "oklch(82.9% 0.123 160.8)",
  "oklch(80.3% 0.106 203.4)",
  "oklch(76.4% 0.131 260.4)",
  "oklch(74.3% 0.193 287.2)",
  "oklch(77.7% 0.204 305.7)",
  "oklch(78.2% 0.201 333.8)",
];

const DEFAULT_SECTION_NAME = "Unsectioned";

const sectionOrderInputSchema = z.object({
  sectionIds: z.array(z.number()).min(1),
});

const listOrderInputSchema = z.object({
  sections: z
    .array(
      z.object({
        sectionId: z.number(),
        listIds: z.array(z.number()),
      }),
    )
    .min(1),
});

const getMaxPosition = async (
  db: Pick<typeof import("../database").initDb, never> | any,
  table: "list" | "listSection",
  sectionId?: number,
) => {
  let query = db
    .selectFrom(table)
    .select(sql<number>`coalesce(max(position), -1)`.as("maxPosition"))
    .where("deletedAt", "is", null);

  if (sectionId !== undefined) query = query.where("sectionId", "=", sectionId);

  const result = await query.executeTakeFirst();
  return Number(result?.maxPosition ?? -1);
};

const getDefaultSection = async (db: any) => {
  const existing = await db
    .selectFrom("listSection")
    .selectAll()
    .where("isDefault", "=", true)
    .where("deletedAt", "is", null)
    .executeTakeFirst();

  if (existing) return existing;

  const now = new Date().toISOString();
  const position = (await getMaxPosition(db, "listSection")) + 1;

  return await db
    .insertInto("listSection")
    .values({
      name: DEFAULT_SECTION_NAME,
      position,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
};

const validateSectionName = async (db: any, name: string, excludeSectionId?: number) => {
  const result = listSectionNameSchema.safeParse(name);

  if (!result.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: result.error.issues[0]?.message ?? "Invalid section name",
    });
  }

  let query = db
    .selectFrom("listSection")
    .select(["id"])
    .where("deletedAt", "is", null)
    .where(sql<string>`lower(name)`, "=", result.data.toLowerCase());

  if (excludeSectionId !== undefined) query = query.where("id", "!=", excludeSectionId);

  const existing = await query.executeTakeFirst();
  if (existing) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "A section with this name already exists.",
    });
  }

  return result.data;
};

const normalizeSectionPositions = async (db: any) => {
  const sections = await db
    .selectFrom("listSection")
    .select(["id"])
    .where("deletedAt", "is", null)
    .orderBy("position", "asc")
    .orderBy("id", "asc")
    .execute();

  for (const [position, section] of sections.entries()) {
    await db.updateTable("listSection").set({ position }).where("id", "=", section.id).execute();
  }
};

export const listRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const lists = await ctx.db
        .selectFrom("list")
        .selectAll()
        .where("deletedAt", "is", null)
        .orderBy("sectionId", "asc")
        .orderBy("position", "asc")
        .orderBy("updatedAt", "asc")
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
          const existingLists = await trx
            .selectFrom("list")
            .select("color")
            .where("deletedAt", "is", null)
            .execute();

          const usedColors = new Set(existingLists.map((l) => l.color).filter(Boolean));
          const color = LIST_COLORS.find((c) => !usedColors.has(c)) ?? LIST_COLORS[0];
          const defaultSection = await getDefaultSection(trx);
          const position = (await getMaxPosition(trx, "list", defaultSection.id)) + 1;

          const newList = await trx
            .insertInto("list")
            .values({
              name: input.name,
              color,
              sectionId: defaultSection.id,
              position,
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

  sections: router({
    getAll: publicProcedure.query(async ({ ctx }) => {
      try {
        await getDefaultSection(ctx.db);

        const sections = await ctx.db
          .selectFrom("listSection")
          .selectAll()
          .where("deletedAt", "is", null)
          .orderBy("position", "asc")
          .orderBy("id", "asc")
          .execute();

        const lists = await ctx.db
          .selectFrom("list")
          .selectAll()
          .where("deletedAt", "is", null)
          .orderBy("sectionId", "asc")
          .orderBy("position", "asc")
          .orderBy("updatedAt", "asc")
          .execute();

        return sections.map((section) => ({
          ...section,
          lists: lists.filter((list) => list.sectionId === section.id),
        }));
      } catch (e) {
        logging.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch list sections",
        });
      }
    }),

    create: publicProcedure
      .input(z.object({ name: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const name = await validateSectionName(ctx.db, input.name);

          return await ctx.db.transaction().execute(async (trx) => {
            const position = (await getMaxPosition(trx, "listSection")) + 1;
            return await trx
              .insertInto("listSection")
              .values({ name, position, isDefault: false })
              .returningAll()
              .executeTakeFirstOrThrow();
          });
        } catch (e) {
          if (e instanceof TRPCError) throw e;
          logging.error(e);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create list section",
          });
        }
      }),

    rename: publicProcedure
      .input(z.object({ sectionId: z.number(), name: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const section = await ctx.db
            .selectFrom("listSection")
            .selectAll()
            .where("id", "=", input.sectionId)
            .where("deletedAt", "is", null)
            .executeTakeFirst();

          if (!section) throw new TRPCError({ code: "NOT_FOUND", message: "Section not found" });
          if (section.isDefault) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "The default section cannot be renamed.",
            });
          }

          const name = await validateSectionName(ctx.db, input.name, input.sectionId);

          await ctx.db
            .updateTable("listSection")
            .set({ name, updatedAt: new Date().toISOString() })
            .where("id", "=", input.sectionId)
            .execute();

          return { success: true as const };
        } catch (e) {
          if (e instanceof TRPCError) throw e;
          logging.error(e);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to rename list section",
          });
        }
      }),

    delete: publicProcedure
      .input(z.object({ sectionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.db.transaction().execute(async (trx) => {
            const section = await trx
              .selectFrom("listSection")
              .selectAll()
              .where("id", "=", input.sectionId)
              .where("deletedAt", "is", null)
              .executeTakeFirst();

            if (!section) throw new TRPCError({ code: "NOT_FOUND", message: "Section not found" });
            if (section.isDefault) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "The default section cannot be deleted.",
              });
            }

            const defaultSection = await getDefaultSection(trx);
            const movedLists = await trx
              .selectFrom("list")
              .select(["id"])
              .where("sectionId", "=", input.sectionId)
              .where("deletedAt", "is", null)
              .orderBy("position", "asc")
              .orderBy("updatedAt", "asc")
              .execute();

            const firstPosition = (await getMaxPosition(trx, "list", defaultSection.id)) + 1;
            for (const [offset, list] of movedLists.entries()) {
              await trx
                .updateTable("list")
                .set({ sectionId: defaultSection.id, position: firstPosition + offset })
                .where("id", "=", list.id)
                .execute();
            }

            await trx
              .updateTable("listSection")
              .set({ deletedAt: new Date().toISOString() })
              .where("id", "=", input.sectionId)
              .execute();

            await normalizeSectionPositions(trx);

            return { success: true as const, movedListCount: movedLists.length };
          });
        } catch (e) {
          if (e instanceof TRPCError) throw e;
          logging.error(e);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete list section",
          });
        }
      }),

    reorder: publicProcedure.input(sectionOrderInputSchema).mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.transaction().execute(async (trx) => {
          const sections = await trx
            .selectFrom("listSection")
            .select(["id"])
            .where("deletedAt", "is", null)
            .execute();

          const activeIds = new Set(sections.map((section) => section.id));
          const requestedIds = new Set(input.sectionIds);
          if (
            activeIds.size !== requestedIds.size ||
            input.sectionIds.some((id) => !activeIds.has(id))
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Section order must include every active section exactly once.",
            });
          }

          for (const [position, sectionId] of input.sectionIds.entries()) {
            await trx
              .updateTable("listSection")
              .set({ position })
              .where("id", "=", sectionId)
              .execute();
          }

          return { success: true as const };
        });
      } catch (e) {
        if (e instanceof TRPCError) throw e;
        logging.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reorder list sections",
        });
      }
    }),
  }),

  reorderLists: publicProcedure.input(listOrderInputSchema).mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.transaction().execute(async (trx) => {
        const seenListIds = new Set<number>();

        for (const sectionOrder of input.sections) {
          const section = await trx
            .selectFrom("listSection")
            .select(["id"])
            .where("id", "=", sectionOrder.sectionId)
            .where("deletedAt", "is", null)
            .executeTakeFirst();

          if (!section) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Section not found" });
          }

          for (const listId of sectionOrder.listIds) {
            if (seenListIds.has(listId)) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "List order cannot contain duplicate list ids.",
              });
            }
            seenListIds.add(listId);
          }
        }

        if (seenListIds.size > 0) {
          const foundLists = await trx
            .selectFrom("list")
            .select(["id"])
            .where("id", "in", [...seenListIds])
            .where("deletedAt", "is", null)
            .execute();

          if (foundLists.length !== seenListIds.size) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "List order contains an unknown list.",
            });
          }
        }

        for (const sectionOrder of input.sections) {
          for (const [position, listId] of sectionOrder.listIds.entries()) {
            await trx
              .updateTable("list")
              .set({ sectionId: sectionOrder.sectionId, position })
              .where("id", "=", listId)
              .execute();
          }
        }

        return { success: true as const };
      });
    } catch (e) {
      if (e instanceof TRPCError) throw e;
      logging.error(e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to reorder lists",
      });
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

  updateColor: publicProcedure
    .input(z.object({ listId: z.number(), color: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .updateTable("list")
          .set({ color: input.color })
          .where("id", "=", input.listId)
          .execute();
      } catch (e) {
        logging.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update list color",
        });
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
