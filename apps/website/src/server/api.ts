import { createServerFn } from "@tanstack/solid-start";
import { setResponseHeader } from "@tanstack/solid-start/server";

import { authedMiddleware } from "./auth";
import { getDb } from "./db/client";
import * as h from "./handlers";

/**
 * The 16 server functions of spec §5: each one is auth middleware + zod validator
 * around a plain handler from `./handlers`. Reads are GET, mutations POST.
 */
const authed = createServerFn({ method: "GET" }).middleware([authedMiddleware]);
const authedPost = createServerFn({ method: "POST" }).middleware([authedMiddleware]);

// Catalog — global, immutable between deploys, so the browser may keep it a day.
export const getCatalog = authed.handler(async () => {
  setResponseHeader("Cache-Control", "private, max-age=86400, immutable");
  return h.getCatalog(getDb());
});

// Sections
export const getSectionsWithLists = authed.handler(({ context }) =>
  h.getSectionsWithLists(getDb(), context.userId),
);
export const createSection = authedPost
  .validator(h.createSectionInput)
  .handler(({ context, data }) => h.createSection(getDb(), context.userId, data));
export const renameSection = authedPost
  .validator(h.renameSectionInput)
  .handler(({ context, data }) => h.renameSection(getDb(), context.userId, data));
export const deleteSection = authedPost
  .validator(h.deleteSectionInput)
  .handler(({ context, data }) => h.deleteSection(getDb(), context.userId, data));
export const reorderSections = authedPost
  .validator(h.reorderSectionsInput)
  .handler(({ context, data }) => h.reorderSections(getDb(), context.userId, data));

// Lists
export const createList = authedPost
  .validator(h.createListInput)
  .handler(({ context, data }) => h.createList(getDb(), context.userId, data));
export const deleteList = authedPost
  .validator(h.deleteListInput)
  .handler(({ context, data }) => h.deleteList(getDb(), context.userId, data));
export const renameList = authedPost
  .validator(h.renameListInput)
  .handler(({ context, data }) => h.renameList(getDb(), context.userId, data));
export const updateListColor = authedPost
  .validator(h.updateListColorInput)
  .handler(({ context, data }) => h.updateListColor(getDb(), context.userId, data));
export const reorderLists = authedPost
  .validator(h.reorderListsInput)
  .handler(({ context, data }) => h.reorderLists(getDb(), context.userId, data));

// Items
export const getListItems = authed
  .validator(h.getListItemsInput)
  .handler(({ context, data }) => h.getListItems(getDb(), context.userId, data));
export const addListItems = authedPost
  .validator(h.addListItemsInput)
  .handler(({ context, data }) => h.addListItems(getDb(), context.userId, data));
export const removeListItems = authedPost
  .validator(h.removeListItemsInput)
  .handler(({ context, data }) => h.removeListItems(getDb(), context.userId, data));
export const duplicateListItem = authedPost
  .validator(h.duplicateListItemInput)
  .handler(({ context, data }) => h.duplicateListItem(getDb(), context.userId, data));
export const updateListItems = authedPost
  .validator(h.updateListItemsInput)
  .handler(({ context, data }) => h.updateListItems(getDb(), context.userId, data));

// Profile
export const getProfile = authed.handler(({ context }) => h.getProfile(getDb(), context.userId));
export const updateProfile = authedPost
  .validator(h.updateProfileInput)
  .handler(({ context, data }) => h.updateProfile(getDb(), context.userId, data));
