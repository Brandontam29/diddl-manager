import { toaster } from "@kobalte/core/toast";
import { useAction, useMatch, useParams } from "@solidjs/router";
import { CircleX, Download, Minus, Plus, SplineIcon } from "lucide-solid";
import { type Component, JSX, Show, createMemo, createSignal } from "solid-js";

import type { Diddl, ListItem } from "@shared";

import { Toast, ToastContent, ToastProgress, ToastTitle } from "@renderer/components/ui/toast";
import { diddlStore, setDiddlStore } from "@renderer/features/diddl";
import { addListItemsAction, updateListItemsAction } from "@renderer/features/lists";
import AddToListPopover from "@renderer/features/lists/components/AddToListPopover";
import createAsyncCallback from "@renderer/hooks/createAsyncCallback";
import useScreenWidth from "@renderer/hooks/useScreenWidth";
import { cn } from "@renderer/libs/cn";
import { confettiStars } from "@renderer/libs/confetti";

const OPTIONS = {
  home: ["hihi", "list:add", "download"],
  list: ["list:add", "list:remove", "list:update", "download"],
} as const;

type Action = (typeof OPTIONS)[keyof typeof OPTIONS][number];

const Taskbar: Component<{ diddls: (Diddl & { listItem?: ListItem })[] }> = (props) => {
  const screenWidth = useScreenWidth();
  const [open, setOpen] = createSignal(false);
  const updateListItems = useAction(updateListItemsAction);
  const addListItems = useAction(addListItemsAction);

  const onDownloadImages: JSX.EventHandler<HTMLButtonElement, MouseEvent> = async (e) => {
    const diddlIds = diddlStore.selectedIndices.map((index) => props.diddls[index]?.id || -1);
    const result = await window.api.downloadImages(diddlIds);

    if (!result) return;

    confettiStars(e);
    toaster.show((props) => (
      <Toast toastId={props.toastId}>
        <ToastContent>
          <ToastTitle>Sucessfully Downloaded</ToastTitle>
        </ToastContent>
        <ToastProgress />
      </Toast>
    ));
  };

  const { isLoading: downloadImagesIsLoading, handler: downloadImagesHandler } =
    createAsyncCallback(onDownloadImages);

  const isHome = useMatch(() => "/");

  // const isList = useMatch(() => "/list/*");

  const hasAction = (action: Action) => {
    if (isHome()) {
      return (OPTIONS.home as readonly Action[]).includes(action);
    }

    return (OPTIONS.list as readonly Action[]).includes(action);
  };

  const params = useParams();
  const id = createMemo(() => (params.id === undefined ? null : parseInt(params.id)));
  const selectedIndices = () => diddlStore.selectedIndices;

  return (
    <div
      class={cn(
        "fixed top-0 left-[256px] flex items-center gap-2",
        "rounded-b-md border-x border-b-2 border-gray-300 bg-white px-2 py-1 shadow",
      )}
      style={{ width: `${screenWidth() - 256 - 32}px` }}
    >
      <button
        class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
        onClick={() => setDiddlStore("selectedIndices", [])}
      >
        <CircleX size={15} /> <span>{diddlStore.selectedIndices.length} Selected</span>
      </button>

      <div class="h-[24px] w-px bg-gray-200" />

      <AddToListPopover
        open={open()}
        onOpenChange={setOpen}
        onListClick={async (listId) => {
          await addListItems(
            listId,
            diddlStore.selectedIndices.map((index) => props.diddls[index]?.id || -1),
          );
          setDiddlStore("selectedIndices", []);
          setOpen(false);
        }}
      />

      <Show when={hasAction("list:update")}>
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={() => {
            const listId = id();

            if (listId === null) return;

            updateListItems(
              listId,
              selectedIndices().map((i) => props.diddls[i]?.listItem?.id || -1),
              { addQuantity: 1 },
            );
          }}
        >
          <Plus />
          <span>Add 1</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={async () => {
            const listId = id();

            if (listId === null) return;

            const result = await updateListItems(
              listId,
              selectedIndices().map((i) => props.diddls[i]?.listItem?.id || -1),
              { addQuantity: -1 },
            );

            console.log(result);
            if (result?.data?.numDeletedRows) setDiddlStore("selectedIndices", []);
          }}
        >
          <Minus />
          <span>Remove 1</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />{" "}
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={() => {
            const listId = id();

            if (listId === null) return;

            updateListItems(
              listId,
              selectedIndices().map((i) => props.diddls[i]?.listItem?.id || -1),
              { isIncomplete: false },
            );
          }}
        >
          <span>Set as Complete</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />{" "}
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={() => {
            const listId = id();

            if (listId === null) return;

            updateListItems(
              listId,
              selectedIndices().map((i) => props.diddls[i]?.listItem?.id || -1),
              { isIncomplete: true },
            );
          }}
        >
          <span>Set as Incomplete</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />{" "}
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={() => {
            const listId = id();

            if (listId === null) return;

            updateListItems(
              listId,
              selectedIndices().map((i) => props.diddls[i]?.listItem?.id || -1),
              { isDamaged: false },
            );
          }}
        >
          <span>Set as Mint</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />{" "}
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={() => {
            const listId = id();

            if (listId === null) return;

            updateListItems(
              listId,
              selectedIndices().map((i) => props.diddls[i]?.listItem?.id || -1),
              { isDamaged: true },
            );
          }}
        >
          <span>Set as Damaged</span>
        </button>
      </Show>

      <div class="h-[24px] w-px bg-gray-200" />
      <button
        class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
        onClick={downloadImagesHandler}
      >
        {downloadImagesIsLoading() ? (
          <SplineIcon size={16} class="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        <span>Download</span>
      </button>
    </div>
  );
};

export default Taskbar;
