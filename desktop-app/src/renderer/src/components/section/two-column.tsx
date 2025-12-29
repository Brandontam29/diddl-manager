import { cn } from "@renderer/libs/cn";
import { Component, JSXElement } from "solid-js";

export const Section: Component<{ children?: JSXElement }> = (props) => {
  return (
    <div class="divide-y divide-gray-900/10 dark:divide-white/10">
      <div class="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">{props.children}</div>
    </div>
  );
};

export const SectionHeader: Component<{ children?: JSXElement }> = (props) => {
  return <div class="px-4 sm:px-0">{props.children}</div>;
};

export const SectionTitle: Component<{ children?: JSXElement }> = (props) => {
  return <h2 class="text-base/7 font-semibold text-gray-900 dark:text-white">{props.children}</h2>;
};
export const SectionDescription: Component<{ children?: JSXElement }> = (props) => {
  return <p class="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">{props.children}</p>;
};

export const SectionContent: Component<{ children?: JSXElement }> = (props) => {
  return (
    <div
      class={cn(
        "shadow-xs sm:rounded-xl md:col-span-2 dark:bg-gray-800/50 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10",
        "border border-white",
        "backdrop-blur-md bg-gradient-to-br from-purple-200/70 via-purple-200/10 to-purple-200/70",
      )}
    >
      <div class="px-4 py-6 sm:p-8">{props.children}</div>
    </div>
  );
};
