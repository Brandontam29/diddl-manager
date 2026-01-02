import { A } from "@solidjs/router";
import { CogIcon, SquareLibraryIcon } from "lucide-solid";
import { IconTypes } from "solid-icons";
import { BiRegularHomeHeart } from "solid-icons/bi";
import {
  type Component,
  For,
  type JSX,
  JSXElement,
  Match,
  Show,
  Switch,
  createMemo,
} from "solid-js";
import { Dynamic } from "solid-js/web";

import { cn } from "@renderer/libs/cn";

const getParams = (params: { type?: string; from?: number; to?: number }) => {
  const paramsStrings = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, `${value}`]),
  );

  const searchParams = new URLSearchParams(paramsStrings);

  return `/?${searchParams.toString()}`;
};

const Sidebar: Component<{ currentPath: string }> = (props) => {
  const links = createMemo(
    () =>
      [
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
          links: [
            { label: "1-99", href: getParams({ type: "rectangular-memo", from: 0, to: 98 }) },
          ],
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
      }[],
  );

  return (
    <nav
      class={cn(
        "flex flex-col gap-4 border-r border-gray-200 py-4",
        "sticky top-0 h-screen w-64 min-w-64 overflow-y-auto",
        "scrollbar-thumb-purple-200 scrollbar-track-transparent scrollbar-thin",
      )}
    >
      <TopLinkContainer>
        <SidebarLink href="/" currentPath={props.currentPath} icon={BiRegularHomeHeart} size={24}>
          Home
        </SidebarLink>
        <SidebarLink
          href="lists"
          currentPath={props.currentPath}
          icon={SquareLibraryIcon}
          size={18}
        >
          Lists
        </SidebarLink>
      </TopLinkContainer>
      <TopLinkContainer>
        <For each={links()}>
          {(group) => (
            <div>
              <Show when={group.title} keyed>
                {(title) => (
                  <div class="mb-1 px-4 text-sm font-semibold text-gray-800">{title}</div>
                )}
              </Show>
              <SubLinkContainer>
                <For each={group.links}>
                  {(link) => (
                    <SidebarLink currentPath={props.currentPath} href={link.href}>
                      {link.label}
                    </SidebarLink>
                  )}
                </For>
              </SubLinkContainer>
            </div>
          )}
        </For>
      </TopLinkContainer>
      <div>
        <SidebarLink href="/settings" currentPath={props.currentPath} icon={CogIcon}>
          Settings
        </SidebarLink>
      </div>
    </nav>
  );
};

const TopLinkContainer: Component<{ children: JSXElement }> = (props) => {
  return <div class={cn("space-y-2")}>{props.children}</div>;
};

const SubLinkContainer: Component<{ children: JSXElement }> = (props) => {
  return <div class={cn("ml-5 space-y-0.5 border-l-2 border-gray-400/20")}>{props.children}</div>;
};

const SidebarLink: Component<{
  currentPath: string;
  href: string;
  children: JSXElement;
  icon?: IconTypes;
  size?: number;
}> = (props) => {
  return (
    <Switch fallback={<p>???</p>}>
      <Match when={props.href}>
        <A
          href={props.href}
          class={cn(
            "gradient-border mx-1 flex items-center gap-2 rounded px-3",
            "bg-sidebar",
            props.currentPath === props.href &&
              "border border-white bg-linear-to-br from-purple-300/70 via-purple-300/10 to-purple-300/70 backdrop-blur-md",
            // currentPath() !== props.href && "",
          )}
        >
          <Dynamic component={props.icon} size={props.size || 20} />
          {props.children}
        </A>
      </Match>
      <Match when={!props.href}>{props.children}</Match>
    </Switch>
  );
};

export default Sidebar;
