// "private" queries/mutations/actions are ones that get called from the sveltekit backend, not the client
// they're all protected by the CONVEX_PRIVATE_BRIDGE_KEY

import { v } from "convex/values";
import { customAction, customMutation, customQuery } from "convex-helpers/server/customFunctions";
import {
  action,
  mutation,
  query,
  type ActionCtx,
  type MutationCtx,
  type QueryCtx,
} from "../_generated/server";

export const privateQuery = customQuery(query, {
  args: { apiKey: v.string() },
  input: async (ctx: QueryCtx, { apiKey }) => {
    if (apiKey !== process.env.CONVEX_PRIVATE_BRIDGE_KEY) {
      throw new Error("Invalid API key");
    }
    return { ctx, args: {} };
  },
});

export const privateMutation = customMutation(mutation, {
  args: { apiKey: v.string() },
  input: async (ctx: MutationCtx, { apiKey }) => {
    if (apiKey !== process.env.CONVEX_PRIVATE_BRIDGE_KEY) {
      throw new Error("Invalid API key");
    }
    return { ctx, args: {} };
  },
});

export const privateAction = customAction(action, {
  args: { apiKey: v.string() },
  input: async (ctx: ActionCtx, { apiKey }) => {
    if (apiKey !== process.env.CONVEX_PRIVATE_BRIDGE_KEY) {
      throw new Error("Invalid API key");
    }
    return { ctx, args: {} };
  },
});
