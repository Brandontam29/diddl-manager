import { useQuery, useConvexClient } from "convex-svelte";
import { api } from "../../convex/_generated/api";
import type {
  ListStore,
  GuestList,
  GuestListItem,
  CatalogReference,
  ItemCondition,
} from "./listTypes";
import { SvelteSet } from "svelte/reactivity";
import { toast } from "svelte-sonner";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * ConvexListStore: ListStore implementation backed by Convex reactive queries and mutations.
 *
 * Read-only properties (`lists`, `activeListItems`) come from `useQuery()` reactive
 * subscriptions, mapped to GuestList/GuestListItem shapes.
 *
 * Mutating methods fire Convex mutations in background and let useQuery() subscriptions
 * reconcile the real state (optimistic approach for sync return types).
 */
export function createConvexListStore(): ListStore {
  const client = useConvexClient();

  // Reactive query for all user's lists
  const listsQuery = useQuery(api.authed.lists.listByOwner, {});

  let activeListId = $state<string | null>(null);

  // Reactive query for active list items — skip when no active list
  const itemsQuery = useQuery(api.authed.listItems.byList, () =>
    activeListId ? { listId: activeListId as Id<"lists"> } : "skip",
  );

  // Auto-set activeListId when lists load and nothing is selected
  $effect(() => {
    const lists = listsQuery.data;
    if (lists && lists.length > 0 && !activeListId) {
      activeListId = lists[0].id;
    }
  });

  return {
    get lists(): GuestList[] {
      return (listsQuery.data ?? []).map((doc) => ({
        id: doc.id,
        name: doc.name,
        color: doc.color,
        createdAt: doc.createdAt,
      }));
    },

    get activeListId() {
      return activeListId;
    },

    get activeListItems(): GuestListItem[] {
      return (itemsQuery.data ?? []).map((doc) => ({
        id: doc.id,
        listId: doc.listId as string,
        catalogRef: doc.catalogRef as CatalogReference,
        condition: doc.condition as ItemCondition,
        quantity: doc.quantity,
        complete: doc.complete,
        tags: doc.tags,
      }));
    },

    createList(name: string, color: string): GuestList {
      const tempId = crypto.randomUUID();
      const placeholder: GuestList = { id: tempId, name, color, createdAt: Date.now() };

      client
        .mutation(api.authed.lists.create, { name, color })
        .then((result) => {
          // Set active to the real Convex ID once mutation completes
          activeListId = result.id;
        })
        .catch(() => {
          toast.error("You can create up to 3 lists.");
        });

      return placeholder;
    },

    updateList(id, updates) {
      client
        .mutation(api.authed.lists.update, {
          id: id as Id<"lists">,
          ...(updates.name !== undefined ? { name: updates.name } : {}),
          ...(updates.color !== undefined ? { color: updates.color } : {}),
        })
        .catch(() => toast.error("Failed to update list"));
    },

    deleteList(id) {
      if (activeListId === id) {
        const remaining = (listsQuery.data ?? []).filter((l) => l.id !== id);
        activeListId = remaining[0]?.id ?? null;
      }
      client
        .mutation(api.authed.lists.remove, { id: id as Id<"lists"> })
        .catch(() => toast.error("Failed to delete list"));
    },

    setActiveList(id) {
      activeListId = id;
    },

    addCatalogItems(listId, refs: CatalogReference[]) {
      // The authed addCatalogItems mutation accepts natural keys (type:number)
      // and resolves them to catalogItemIds server-side
      client
        .mutation(api.authed.listItems.addCatalogItems, {
          listId: listId as Id<"lists">,
          refs: refs.map((ref) => ({ type: ref.type, number: ref.number })),
        })
        .catch(() => toast.error("Failed to add items"));
    },

    removeItems(itemIds) {
      client
        .mutation(api.authed.listItems.remove, {
          itemIds: itemIds as Id<"listItems">[],
        })
        .catch(() => toast.error("Failed to remove items"));
    },

    updateItems(itemIds, updates) {
      client
        .mutation(api.authed.listItems.update, {
          itemIds: itemIds as Id<"listItems">[],
          ...(updates.condition !== undefined ? { condition: updates.condition } : {}),
          ...(updates.quantity !== undefined ? { quantity: updates.quantity } : {}),
          ...(updates.complete !== undefined ? { complete: updates.complete } : {}),
        })
        .catch(() => toast.error("Failed to update items"));
    },

    duplicateItems(itemIds) {
      client
        .mutation(api.authed.listItems.duplicate, {
          itemIds: itemIds as Id<"listItems">[],
        })
        .catch(() => toast.error("Failed to duplicate items"));
      // Optimistic: return empty array, useQuery will reconcile
      return [];
    },

    getCompletionPercent(listId) {
      const listItems = (itemsQuery.data ?? []).filter((i) => (i.listId as string) === listId);
      if (listItems.length === 0) return 0;
      const completeCount = listItems.filter((i) => i.complete).length;
      return Math.round((completeCount / listItems.length) * 100);
    },

    getOwnedCatalogKeys(listId) {
      const listItems = (itemsQuery.data ?? []).filter((i) => (i.listId as string) === listId);
      return new SvelteSet(
        listItems.map((i) => {
          const ref = i.catalogRef as CatalogReference;
          return `${ref.type}:${ref.number}`;
        }),
      );
    },

    getItemCount(listId) {
      return (itemsQuery.data ?? []).filter((i) => (i.listId as string) === listId).length;
    },

    getOwnedCountByType(listId, type) {
      return (itemsQuery.data ?? []).filter((i) => {
        const ref = i.catalogRef as CatalogReference;
        return (i.listId as string) === listId && ref.type === type;
      }).length;
    },

    getOwnedCountByRange(listId, type, start, end) {
      return (itemsQuery.data ?? []).filter((i) => {
        const ref = i.catalogRef as CatalogReference;
        return (
          (i.listId as string) === listId &&
          ref.type === type &&
          ref.number >= start &&
          ref.number <= end
        );
      }).length;
    },
  };
}
