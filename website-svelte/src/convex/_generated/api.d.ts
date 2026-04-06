/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as authed_adminHelpers from "../authed/adminHelpers.js";
import type * as authed_catalog from "../authed/catalog.js";
import type * as authed_cmsCatalog from "../authed/cmsCatalog.js";
import type * as authed_demo from "../authed/demo.js";
import type * as authed_diddlTypes from "../authed/diddlTypes.js";
import type * as authed_helpers from "../authed/helpers.js";
import type * as authed_listItems from "../authed/listItems.js";
import type * as authed_lists from "../authed/lists.js";
import type * as authed_migration from "../authed/migration.js";
import type * as private_demo from "../private/demo.js";
import type * as private_helpers from "../private/helpers.js";
import type * as private_migrateCatalogStatus from "../private/migrateCatalogStatus.js";
import type * as private_migration from "../private/migration.js";
import type * as private_migrationInternals from "../private/migrationInternals.js";
import type * as private_seed from "../private/seed.js";
import type * as private_seedMutations from "../private/seedMutations.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "authed/adminHelpers": typeof authed_adminHelpers;
  "authed/catalog": typeof authed_catalog;
  "authed/cmsCatalog": typeof authed_cmsCatalog;
  "authed/demo": typeof authed_demo;
  "authed/diddlTypes": typeof authed_diddlTypes;
  "authed/helpers": typeof authed_helpers;
  "authed/listItems": typeof authed_listItems;
  "authed/lists": typeof authed_lists;
  "authed/migration": typeof authed_migration;
  "private/demo": typeof private_demo;
  "private/helpers": typeof private_helpers;
  "private/migrateCatalogStatus": typeof private_migrateCatalogStatus;
  "private/migration": typeof private_migration;
  "private/migrationInternals": typeof private_migrationInternals;
  "private/seed": typeof private_seed;
  "private/seedMutations": typeof private_seedMutations;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
