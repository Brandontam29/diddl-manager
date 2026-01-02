import { type BrowserWindow, ipcMain } from "electron";

import { AddListItem, addListItemSchema } from "../../shared";
import { MyDatabase } from "../database";
import { logging } from "../logging";

export const GET_LISTS = "get-lists";
export const CREATE_LIST = "create-list";
export const DELETE_LIST = "delete-list";
export const UPDATE_LIST_NAME = "update-list-name";

export const GET_LIST_ITEMS = "get-list-items";
export const ADD_LIST_ITEMS = "add-list-items";
export const REMOVE_LIST_ITEMS = "remove-list-items";
export const UPDATE_LIST_ITEMS = "update-list-items";

const listMainHandlers = (_browserWindow: BrowserWindow, db: MyDatabase) => {
  /**
   * List
   */
  ipcMain.handle(GET_LISTS, async (_event) => {
    try {
      const lists = await db
        .selectFrom("list")
        .selectAll()
        .where("deletedAt", "is", null)
        .execute();

      if (lists.length === 0) logging.warn("no lists found");

      return lists;
    } catch (e) {
      logging.error(e);
      throw new Error("Failed to fetch lists", { cause: e });
    }
  });

  ipcMain.handle(CREATE_LIST, async (_event, listName: string, diddlIds: number[] = []) => {
    try {
      return await db.transaction().execute(async (trx) => {
        const newList = await trx
          .insertInto("list")
          .values({
            name: listName,
            createdAt: new Date().toISOString(),
            lastModifiedAt: new Date().toISOString(),
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        if (diddlIds.length > 0) {
          const listItems = diddlIds.map((id) => ({
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
      throw new Error("Failed to create list", { cause: e });
    }
  });

  ipcMain.handle(DELETE_LIST, async (_event, listId: number) => {
    try {
      await db
        .updateTable("list")
        .set({ deletedAt: new Date().toISOString() })
        .where("id", "=", listId)
        .execute();
    } catch (e) {
      logging.error(e);
      throw new Error("Failed to delete list", { cause: e });
    }
  });

  ipcMain.handle(UPDATE_LIST_NAME, async (_event, listId: number, newListName: string) => {
    try {
      await db
        .updateTable("list")
        .set({ name: newListName, lastModifiedAt: new Date().toISOString() })
        .where("id", "=", listId)
        .execute();
    } catch (e) {
      logging.error(e);
      throw new Error("Failed to update list name", { cause: e });
    }
  });

  /**
   * List Items
   */

  ipcMain.handle(GET_LIST_ITEMS, async (_event, listId: number) => {
    try {
      const list = await db
        .selectFrom("list")
        .selectAll()
        .where("id", "=", listId)
        .where("deletedAt", "is", null)
        .executeTakeFirst();

      if (!list) {
        return null;
      }

      const items = await db
        .selectFrom("listItem")
        .selectAll()
        .select("quantity")
        .where("listId", "=", listId)
        .execute();

      return items;
    } catch (e) {
      logging.error(e);
      throw new Error("Failed to fetch list details", { cause: e });
    }
  });

  ipcMain.handle(ADD_LIST_ITEMS, async (_event, listId: number, partialListItems: AddListItem) => {
    const partialListItemsResult = addListItemSchema.array().safeParse(partialListItems);

    if (!partialListItemsResult.success) {
      logging.error(partialListItemsResult.error);
      return { success: false, error: "Payload does not conform to the schema" };
    }

    try {
      await db
        .insertInto("listItem")
        .values(partialListItemsResult.data.map((item) => ({ listId: listId, ...item })))
        .onConflict((oc) =>
          oc
            // Specify the columns that have the UNIQUE constraint in your DB
            .columns(["listId", "diddlId"])
            .doNothing(),
        )
        .execute();

      return { success: true };
    } catch (e) {
      logging.error(e);
      throw new Error("Failed to add list items", { cause: e });
    }
  });

  ipcMain.handle(REMOVE_LIST_ITEMS, async (_event, listId: number, idsToRemove: number[]) => {
    try {
      await db
        .deleteFrom("listItem")
        .where("listId", "=", listId)
        .where("diddlId", "in", idsToRemove)
        .execute();

      return { success: true };
    } catch (e) {
      logging.error(e);
      return { success: false };
      // throw new Error("Failed to remove list items");
    }
  });

  ipcMain.handle(
    UPDATE_LIST_ITEMS,
    async (
      _event,
      listId: number,
      listItemIds: number[],
      action: {
        addQuantity?: number;
        isDamaged?: boolean;
        isIncomplete?: boolean;
      },
    ) => {
      try {
        const { addQuantity, isDamaged, isIncomplete } = action;

        const updateResult = await db.transaction().execute(async (trx) => {
          const results = await trx
            .updateTable("listItem")
            .set((eb) => ({
              quantity:
                addQuantity === undefined ? eb.ref("quantity") : eb("quantity", "+", addQuantity),

              isDamaged: isDamaged ?? eb.ref("isDamaged"),

              isIncomplete: isIncomplete ?? eb.ref("isIncomplete"),
            }))
            .returning(["id", "quantity"])
            .where("listId", "=", listId)
            .where("id", "in", listItemIds)
            .execute();

          const idsToDelete = results.filter((row) => row.quantity <= 0).map((row) => row.id);

          if (idsToDelete.length > 0) {
            await trx
              .deleteFrom("listItem")
              .where("listId", "=", listId)
              .where("id", "in", idsToDelete)
              .execute();
          }

          return { numUpdatedRows: results.length, numDeletedRows: idsToDelete.length };
        });

        return { success: true, data: updateResult };
      } catch (e) {
        logging.error(e);
        return { success: false };
      }
    },
  );
};

export default listMainHandlers;
