/* oxlint-disable */
/**
 * Generated utilities for implementing server-side Convex query and mutation functions.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import {
  QueryCtx as GenericQueryCtx,
  MutationCtx as GenericMutationCtx,
  ActionCtx as GenericActionCtx,
  DatabaseReader as GenericDatabaseReader,
  DatabaseWriter as GenericDatabaseWriter,
} from "convex/server";
import type { DataModel } from "./dataModel.js";

export declare const query: any;
export declare const internalQuery: any;
export declare const mutation: any;
export declare const internalMutation: any;
export declare const action: any;
export declare const internalAction: any;
export declare const httpAction: any;

export type QueryCtx = GenericQueryCtx<DataModel>;
export type MutationCtx = GenericMutationCtx<DataModel>;
export type ActionCtx = GenericActionCtx<DataModel>;
