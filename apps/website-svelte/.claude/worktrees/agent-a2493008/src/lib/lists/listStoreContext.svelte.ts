import { createContext } from 'svelte';
import type { ListStore } from './listTypes';

/**
 * Reactive holder that wraps the current ListStore.
 * Allows swapping the underlying store (Guest -> Convex) without
 * breaking existing consumer components.
 */
export interface ReactiveListStoreHolder {
	readonly store: ListStore;
	setStore(store: ListStore): void;
}

const [internalGetContext, setInternalContext] = createContext<ReactiveListStoreHolder>();

/**
 * Get the current ListStore from context.
 * Returns a Proxy that always delegates to the latest underlying store,
 * ensuring reactivity when the store is swapped via setStore().
 */
export function getListStoreContext(): ListStore {
	const holder = internalGetContext();
	if (!holder) {
		throw new Error('ListStore context not found. Ensure initListStoreContext() is called first.');
	}

	// Return a proxy that always delegates to the current store.
	// This ensures that when setStore() swaps the underlying store,
	// subsequent property reads from any consumer will hit the new store.
	return new Proxy({} as ListStore, {
		get(_target, prop) {
			const store = holder.store;
			const value = store[prop as keyof ListStore];
			if (typeof value === 'function') {
				return (value as Function).bind(store);
			}
			return value;
		}
	});
}

/**
 * Initialize the ListStore context with an initial store.
 * Returns a holder with setStore() for swapping the underlying implementation.
 * Must be called during component initialization (in <script> block).
 */
export function initListStoreContext(initialStore: ListStore): ReactiveListStoreHolder {
	let currentStore = $state<ListStore>(initialStore);

	const holder: ReactiveListStoreHolder = {
		get store() {
			return currentStore;
		},
		setStore(store: ListStore) {
			currentStore = store;
		}
	};

	setInternalContext(holder);
	return holder;
}
