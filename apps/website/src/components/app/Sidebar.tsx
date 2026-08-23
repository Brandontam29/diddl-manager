import { Link } from "@tanstack/solid-router";
import { CogIcon, MenuIcon, SquareLibraryIcon } from "lucide-solid";
import { BiRegularHomeHeart } from "solid-icons/bi";
import { type Component, For, JSXElement, Show, createSignal } from "solid-js";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { createIsMobile } from "@/hooks/createIsMobile";
import { onLocationChange } from "@/hooks/onLocationChange";
import { cn } from "@/libs/cn";

import { SIDEBAR_GROUPS } from "./sidebar-links";

const linkClass = cn(
  "gradient-border mx-1 flex items-center gap-2 rounded px-3",
  "bg-sidebar",
  "data-[status=active]:border data-[status=active]:border-white data-[status=active]:bg-linear-to-br data-[status=active]:from-purple-300/70 data-[status=active]:via-purple-300/10 data-[status=active]:to-purple-300/70 data-[status=active]:backdrop-blur-md",
);

const SidebarNav: Component<{ class?: string }> = (props) => {
  return (
    <nav class={cn("flex h-full flex-col", props.class)}>
      <TopLinkContainer class="border-b py-4">
        <Link to="/app" activeOptions={{ exact: true, includeSearch: true }} class={linkClass}>
          <BiRegularHomeHeart size={24} />
          Home
        </Link>
        <Link to="/app/lists" class={linkClass}>
          <SquareLibraryIcon size={18} />
          Lists
        </Link>
      </TopLinkContainer>
      <TopLinkContainer
        class={cn(
          "grow overflow-y-auto",
          "scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent",
        )}
      >
        <For each={SIDEBAR_GROUPS}>
          {(group) => (
            <div>
              <div class="mb-1 px-4 text-sm font-semibold text-gray-800">{group.title}</div>
              <SubLinkContainer>
                <For each={group.links}>
                  {(link) => (
                    <Link
                      to="/app"
                      search={link.search}
                      activeOptions={{ exact: true, includeSearch: true }}
                      class={linkClass}
                    >
                      {link.label}
                    </Link>
                  )}
                </For>
              </SubLinkContainer>
            </div>
          )}
        </For>
      </TopLinkContainer>
      <div class="border-t py-4">
        <Link to="/app/settings" class={linkClass}>
          <CogIcon size={20} />
          Settings
        </Link>
      </div>
    </nav>
  );
};

/**
 * Static 256px column from 768px up; below that a hamburger opens the same nav in a
 * Kobalte `Sheet` (spec §6 "responsive floor = tablet"). Navigating closes the sheet.
 */
const Sidebar: Component = () => {
  const isMobile = createIsMobile();
  const [open, setOpen] = createSignal(false);

  onLocationChange(() => setOpen(false));

  return (
    <Show
      when={isMobile()}
      fallback={<SidebarNav class="sticky top-0 h-screen w-64 min-w-64 border-r border-gray-200" />}
    >
      <button
        class="fixed top-2 left-2 z-30 rounded-md border border-gray-300 bg-white p-2 shadow"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
      >
        <MenuIcon size={20} />
      </button>
      <Sheet open={open()} onOpenChange={setOpen}>
        <SheetContent side="left" class="w-72 p-0 pt-8">
          <SheetTitle class="sr-only">Navigation</SheetTitle>
          <SidebarNav />
        </SheetContent>
      </Sheet>
    </Show>
  );
};

const TopLinkContainer: Component<{ class?: string; children: JSXElement }> = (props) => {
  return <div class={cn("space-y-2", props.class)}>{props.children}</div>;
};

const SubLinkContainer: Component<{ children: JSXElement }> = (props) => {
  return <div class={cn("ml-5 space-y-0.5 border-l-2 border-gray-400/20")}>{props.children}</div>;
};

export default Sidebar;
