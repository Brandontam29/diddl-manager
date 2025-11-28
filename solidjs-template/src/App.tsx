import { createEffect, For, type Component } from "solid-js";
import { listStore } from "./feature/lists";
import Card from "./components/Card";
import { unwrap } from "solid-js/store";
import { fetchListItems, selection } from "./feature/lists/listStore";

const App: Component = () => {
    createEffect(() => fetchListItems());
    createEffect(() => {
        console.log(unwrap(selection));
    });

    return (
        <div class="w-full bg-blue-300 grid justify-start grid-cols-[repeat(auto-fill,100px)] gap-1 p-2">
            <For each={listStore.listItems} fallback={<div>Loading...</div>}>
                {(item, index) => <Card listItem={item} index={index()} />}
            </For>
        </div>
    );
};

export default App;
