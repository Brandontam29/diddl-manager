import { ToastRegion, ToastList } from "@renderer/components/ui/toast";
import FallbackPageLoading from "@renderer/components/FallbackPageLoading";
import { fetchTrackerList, listStore } from "@renderer/features/lists";
import { fetchLibraryState, setLibraryStore } from "@renderer/features/library";
import { A, RouteSectionProps } from "@solidjs/router";
import {
  type Component,
  createEffect,
  For,
  type JSX,
  Match,
  Show,
  Suspense,
  Switch,
} from "solid-js";
import { BiRegularHomeHeart } from "solid-icons/bi";
import { cn } from "@renderer/libs/cn";
import SettingsDialog from "./components/SettingsDialog";
import ListLinks from "./components/ListLinks";
import { BookMarkedIcon } from "lucide-solid";

const getParams = (params: { type?: string; from?: number; to?: number }) => {
  const paramsStrings = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, `${value}`]),
  );

  const searchParams = new URLSearchParams(paramsStrings);

  return `/?${searchParams.toString()}`;
};

const BaseLayout: Component<RouteSectionProps> = (props) => {
  createEffect(() => {
    fetchTrackerList();
    fetchLibraryState();
  });

  createEffect(() => {
    props.location.pathname;
    props.location.search;

    setLibraryStore("selectedIndices", []);
  });

  const LINKS = [
    {
      title: undefined,
      links: [
        {
          label: (
            <>
              <div class="pb-0.5">
                <BiRegularHomeHeart class="h-8 w-8" />
              </div>
              <span>Home</span>
            </>
          ),
          href: "/",
        },
      ],
    },
    {
      title: undefined,
      links: [
        {
          label: (
            <>
              <BookMarkedIcon />
              <span>My Collection </span>
            </>
          ),
          href: "/lists/collection",
        },
      ],
    },
    {
      title: undefined,
      links: [
        {
          label: <ListLinks trackerListItems={listStore.trackerListItems} />,
          href: undefined,
        },
      ],
    },
    {
      title: undefined,
      links: [
        {
          label: <span class="text-transparent">I love Diddl</span>,
          href: "/catherine-is-my-wife",
        },
      ],
    },
    {
      title: "A7",
      links: [{ label: "1-100", href: getParams({ type: "A7", from: 0, to: 99 }) }],
    },
    {
      title: "A6",
      links: [
        { label: "1-99", href: getParams({ type: "A6", from: 0, to: 98 }) },
        { label: "100-199", href: getParams({ type: "A6", from: 99, to: 198 }) },
        { label: "200-299", href: getParams({ type: "A6", from: 199, to: 298 }) },
      ],
    },
    {
      title: "A5",
      links: [
        { label: "1-99", href: getParams({ type: "A5", from: 0, to: 98 }) },
        { label: "100-199", href: getParams({ type: "A5", from: 99, to: 198 }) },
        { label: "200-299", href: getParams({ type: "A5", from: 199, to: 298 }) },
        { label: "300-399", href: getParams({ type: "A5", from: 299, to: 398 }) },
        { label: "400-499", href: getParams({ type: "A5", from: 399, to: 498 }) },
      ],
    },
    {
      title: "A4",
      links: [
        { label: "1-99", href: getParams({ type: "A4", from: 0, to: 98 }) },
        { label: "100-199", href: getParams({ type: "A4", from: 99, to: 198 }) },
      ],
    },
    {
      title: "Series",
      links: [
        { label: "1-99", href: getParams({ type: "series", from: 0, to: 98 }) },
        { label: "100-199", href: getParams({ type: "series", from: 99, to: 198 }) },
      ],
    },
    {
      title: "Gift Paper",
      links: [
        { label: "1-99", href: getParams({ type: "gift-paper", from: 0, to: 98 }) },
        { label: "100-199", href: getParams({ type: "gift-paper", from: 99, to: 198 }) },
        { label: "200-299", href: getParams({ type: "gift-paper", from: 199, to: 298 }) },
      ],
    },
    {
      title: "Birthday",
      links: [{ label: "1-99", href: getParams({ type: "birthday", from: 0, to: 98 }) }],
    },
    {
      title: "Special",
      links: [{ label: "1-99", href: getParams({ type: "special", from: 0, to: 98 }) }],
    },
    {
      title: "Game",
      links: [{ label: "1-99", href: getParams({ type: "game", from: 0, to: 98 }) }],
    },
    {
      title: "A2",
      links: [{ label: "1-99", href: getParams({ type: "A2", from: 0, to: 98 }) }],
    },
    {
      title: "Paper Relief",
      links: [{ label: "1-99", href: getParams({ type: "paper-relief", from: 0, to: 98 }) }],
    },
    {
      title: "Post-It",
      links: [{ label: "1-99", href: getParams({ type: "post-it", from: 0, to: 98 }) }],
    },
    {
      title: "Rectangular Memo",
      links: [{ label: "1-99", href: getParams({ type: "rectangular-memo", from: 0, to: 98 }) }],
    },
    {
      title: "Square Memo",
      links: [{ label: "1-99", href: getParams({ type: "square-memo", from: 0, to: 98 }) }],
    },
    {
      title: "Quardiddl Card",
      links: [{ label: "1-99", href: getParams({ type: "quardiddl-card", from: 0, to: 98 }) }],
    },
    {
      title: "Letter Paper",
      links: [
        { label: "1-99", href: getParams({ type: "letter-paper", from: 0, to: 98 }) },
        { label: "100-199", href: getParams({ type: "letter-paper", from: 99, to: 198 }) },
        { label: "200-299", href: getParams({ type: "letter-paper", from: 199, to: 298 }) },
      ],
    },
    {
      title: "Stamp",
      links: [{ label: "1-99", href: getParams({ type: "stamp", from: 0, to: 98 }) }],
    },
    {
      title: "Paper Bag A5",
      links: [{ label: "1-99", href: getParams({ type: "paper-bag-A5", from: 0, to: 98 }) }],
    },
    {
      title: "Paper Bag A4",
      links: [{ label: "1-99", href: getParams({ type: "paper-bag-A4", from: 0, to: 98 }) }],
    },
    {
      title: "Paper Bag Expo",
      links: [{ label: "1-99", href: getParams({ type: "paper-bag-expo", from: 0, to: 98 }) }],
    },
    {
      title: "Small Bag",
      links: [{ label: "1-99", href: getParams({ type: "bag-small", from: 0, to: 98 }) }],
    },
    {
      title: "Large Bag",
      links: [{ label: "1-99", href: getParams({ type: "bag-large", from: 0, to: 98 }) }],
    },
    {
      title: "Mega Bag",
      links: [{ label: "1-99", href: getParams({ type: "bag-mega", from: 0, to: 98 }) }],
    },
    {
      title: "Plastic Bag",
      links: [{ label: "1-99", href: getParams({ type: "bag-plastic", from: 0, to: 98 }) }],
    },
    {
      title: "Sticker",
      links: [
        { label: "1-99", href: getParams({ type: "sticker", from: 0, to: 98 }) },
        { label: "100-199", href: getParams({ type: "sticker", from: 99, to: 198 }) },
        { label: "200-299", href: getParams({ type: "sticker", from: 199, to: 298 }) },
      ],
    },
    {
      title: "Postal cards",
      links: [
        { label: "1-99", href: getParams({ type: "postal-card", from: 0, to: 98 }) },
        { label: "100-199", href: getParams({ type: "postal-card", from: 99, to: 198 }) },
        { label: "200-299", href: getParams({ type: "postal-card", from: 199, to: 298 }) },
      ],
    },
    {
      title: "Towel",
      links: [{ label: "1-99", href: getParams({ type: "towel", from: 0, to: 98 }) }],
    },
  ] as const satisfies {
    title?: string | JSX.Element;
    links: { label: string | JSX.Element; href?: string }[];
  }[];

  return (
    <>
      <nav
        class={cn(
          "py-4 flex flex-col border-r border-gray-200 h-screen sticky top-0 overflow-y-auto min-w-64 w-64",
          "scrollbar-thumb-pink-300 scrollbar-track-transparent scrollbar-thin",
        )}
      >
        <div></div>
        <For each={LINKS}>
          {(group) => (
            <div class="pt-3">
              <Show when={group.title} keyed>
                {(title) => <div class="px-4 font-semibold">{title}</div>}
              </Show>
              <div class="flex flex-col">
                <For each={group.links}>
                  {(link) => (
                    <Switch fallback={<p>Fallback content</p>}>
                      <Match when={link.href}>
                        <A
                          href={link.href!}
                          class={cn(
                            "flex items-center gap-2 px-3 mx-1 rounded",
                            `${location.pathname}${location.search}` === link.href && "bg-red-200",
                            `${location.pathname}${location.search}` !== link.href &&
                              "hover:bg-red-100",
                          )}
                        >
                          {link.label}
                        </A>
                      </Match>
                      <Match when={!link.href}>{link.label}</Match>
                    </Switch>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
        <div class="pt-3">
          <SettingsDialog />
        </div>
      </nav>
      <Suspense fallback={<FallbackPageLoading />}>{props.children}</Suspense>
      <ToastRegion>
        <ToastList />
      </ToastRegion>
    </>
  );
};

export default BaseLayout;
