import { ListItem } from "@shared";
import { Component, createEffect, createMemo } from "solid-js";
import { cn } from "@/libs/cn";
import { CircleCheck } from "lucide-solid";
import { addSelection, removeSelection, selection } from "@/feature/lists/listStore";
import { unwrap } from "solid-js/store";

const Card: Component<{ listItem: ListItem; index: number }> = (props) => {
    // const [lastSelected , setLastSelected]= createSignal<string| null>(null)

    const selectionMode = createMemo(() => {
        return Object.keys(selection).length > 0;
    });
    const selected = createMemo(() => {
        // return selection.hasOwnProperty(props.listItem.id);
        return props.listItem.id in selection;
    });

    createEffect(() => {
        console.log(unwrap(selection));
    });

    return (
        <div
            class={cn(
                "relative",
                "bg-green-200 border-2 border-amber-100 flex items-center justify-center w-24 h-24 group/card"
            )}
        >
            <button
                class={cn(
                    "hidden absolute top-1 left-1 p-1 text-white",
                    !selectionMode() && "group-hover/card:block",
                    selectionMode() && "block",
                    selected() && "text-blue-300"
                )}
                onClick={() => {
                    if (selected()) {
                        removeSelection(props.listItem.id);
                        return;
                    }
                    if (!selected()) {
                        addSelection(props.listItem.id, props.index);
                        return;
                    }
                }}
            >
                <CircleCheck />
            </button>
            {props.listItem.id}
        </div>
    );
};

export default Card;
