import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import { setResponseHeader } from "@tanstack/solid-start/server";

import { authedMiddleware } from "./auth";
import { getDb } from "./db/client";
import { NotFoundError } from "./errors";
import * as h from "./handlers";

/**
 * The 16 server functions of spec §5 plus `deleteAccount` (spec §4): each one is auth middleware + zod validator
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
//
// A thrown `AppError` reaches the browser as a plain `Error` carrying only its
// message (see ./errors), whereas `notFound()` is a first-class router signal that
// Start serialises as a 404 and the client re-throws intact — so the one read that a
// route loader keys on converts NOT_FOUND here, on the server, and the route's
// `notFoundComponent` takes over (spec §6).
export const getListItems = authed
  .validator(h.getListItemsInput)
  .handler(async ({ context, data }) => {
    try {
      return await h.getListItems(getDb(), context.userId, data);
    } catch (error) {
      if (error instanceof NotFoundError) throw notFound();
      throw error;
    }
  });
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
// Soft-deletes the caller's rows; the client then deletes the Clerk user (spec §4).
export const deleteAccount = authedPost.handler(({ context }) =>
  h.deleteAccount(getDb(), context.userId),
);
