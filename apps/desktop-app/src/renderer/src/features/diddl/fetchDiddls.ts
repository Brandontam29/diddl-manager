import { createAsyncStore, query } from "@solidjs/router";

import type { Diddl } from "@shared";

import { trpc } from "@renderer/libs/trpc";

export const fetchDiddls = query(async () => {
  try {
    return await trpc.diddl.getAll.query();
  } catch (e) {
    console.error("Failed to fetch diddls:", e);
    return null;
  }
}, "diddls");

export const useDiddls = () =>
  createAsyncStore<Diddl[] | null>(() => fetchDiddls(), {
    initialValue: null,

    reconcile: {
      key: "id",
      merge: false,
    },
  });
