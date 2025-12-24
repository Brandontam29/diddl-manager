// import { diddlStore, setDiddlStore } from "@renderer/features/diddl";
// import useScreenWidth from "@renderer/hooks/useScreenWidth";
// import { cn } from "@renderer/libs/cn";
// import { Diddl } from "@shared";
// import { useParams } from "@solidjs/router";
// import { Plus, Minus, Download, SplineIcon, CircleX } from "lucide-solid";
// import { Component, createMemo, createSignal } from "solid-js";
// import { addListItems, updateListItems } from "../lists/listMethods";
// import AddToListPopover from "../lists/components/AddToListPopover";
// import createAsyncCallback from "@renderer/hooks/createAsyncCallback";
// import { Toast, ToastContent, ToastProgress, ToastTitle } from "@renderer/components/ui/toast";
// import { confettiStars } from "@rendererlibs/confetti";
// import { toaster } from "@kobalte/core/toast";

// const TaskbarList: Component<{ diddls: Diddl[] }> = (props) => {
//   const screenWidth = useScreenWidth();
//   const [open, setOpen] = createSignal(false);
//   const params = useParams();

//   const id = createMemo(() => parseInt(params.id));
//   const selectedIndices = () => diddlStore.selectedIndices;

//   const onDownloadImages = async (e: MouseEvent & { target: HTMLButtonElement }) => {
//     const diddlIds = diddlStore.selectedIndices.map((index) => props.diddls[index].id || -1);
//     const result = await window.api.downloadImages(diddlIds);

//     if (!result) return;

//     confettiStars(e);
//     toaster.show((props) => (
//       <Toast toastId={props.toastId}>
//         <ToastContent>
//           <ToastTitle>Sucessfully Downloaded</ToastTitle>
//         </ToastContent>
//         <ToastProgress />
//       </Toast>
//     ));
//   };
//   const { isLoading: downloadImagesIsLoading, handler: downloadImagesHandler } =
//     createAsyncCallback(onDownloadImages);

//   return (
//     <div
//       class={cn(
//         "fixed top-0 left-[256px] flex items-center gap-2",
//         "bg-white py-1 px-2 rounded-b-md border-x border-b-2 shadow border-gray-300",
//       )}
//       style={{ width: `${screenWidth() - 256 - 32}px` }}
//     >
//       <button
//         class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
//         onClick={async () => setDiddlStore("selectedIndices", [])}
//       >
//         <CircleX size={15} /> <span>{diddlStore.selectedIndices.length} Selected</span>
//       </button>
//       <div class="h-[24px] w-0.5 bg-gray-200" />
//       <AddToListPopover
//         open={open()}
//         onOpenChange={setOpen}
//         onListClick={async (listId) => {
//           await addListItems(
//             listId,
//             diddlStore.selectedIndices.map((index) => props.diddls[index].id),
//           );
//           setDiddlStore("selectedIndices", []);
//           setOpen(false);
//         }}
//       />
//       <div class="h-[24px] w-0.5 bg-gray-200" />
//       <button
//         class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
//         onClick={() => {
//           updateListItems(
//             id(),
//             selectedIndices().map((i) => props.diddls[i].id),
//             { addCount: 1 },
//           );
//         }}
//       >
//         <Plus />
//         <span>Add 1</span>
//       </button>
//       <div class="h-[24px] w-0.5 bg-gray-200" />
//       <button
//         class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
//         onClick={() => {
//           updateListItems(
//             id(),
//             selectedIndices().map((i) => props.diddls[i].id),
//             { addCount: -1 },
//           );
//         }}
//       >
//         <Minus />
//         <span>Remove 1</span>
//       </button>
//       <div class="h-[24px] w-0.5 bg-gray-200" />{" "}
//       <button
//         class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
//         onClick={() => {
//           updateListItems(
//             id(),
//             selectedIndices().map((i) => props.diddls[i].id),
//             { isIncomplete: false },
//           );
//         }}
//       >
//         <span>Set as Complete</span>
//       </button>
//       <div class="h-[24px] w-0.5 bg-gray-200" />{" "}
//       <button
//         class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
//         onClick={() => {
//           updateListItems(
//             id(),
//             selectedIndices().map((i) => props.diddls[i].id),
//             { isIncomplete: true },
//           );
//         }}
//       >
//         <span>Set as Incomplete</span>
//       </button>
//       <div class="h-[24px] w-0.5 bg-gray-200" />{" "}
//       <button
//         class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
//         onClick={() => {
//           updateListItems(
//             id(),
//             selectedIndices().map((i) => props.diddls[i].id),
//             { isDamaged: false },
//           );
//         }}
//       >
//         <span>Set as Mint</span>
//       </button>
//       <div class="h-[24px] w-0.5 bg-gray-200" />{" "}
//       <button
//         class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
//         onClick={() => {
//           updateListItems(
//             id(),
//             selectedIndices().map((i) => props.diddls[i].id),
//             { isDamaged: true },
//           );
//         }}
//       >
//         <span>Set as Damaged</span>
//       </button>
//       <button
//         class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
//         onClick={downloadImagesHandler}
//       >
//         {downloadImagesIsLoading() ? (
//           <SplineIcon size={16} class="animate-spin" />
//         ) : (
//           <Download size={16} />
//         )}
//         <span>Download</span>
//       </button>
//     </div>
//   );
// };

// export default TaskbarList;
