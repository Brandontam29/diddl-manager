import { fetchAcquiredState } from '@renderer/features/acquired';
import { fetchLibraryState } from '@renderer/features/library';
import { A, useLocation } from '@solidjs/router';
import { createEffect, For, Show } from 'solid-js';

const getParams = (params: { type?: string; from?: number; to?: number; owned?: boolean }) => {
  const paramsStrings = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, `${value}`])
  );

  const searchParams = new URLSearchParams(paramsStrings);

  return `/?${searchParams.toString()}`;
};

const LINKS = [
  {
    title: undefined,
    links: [{ label: 'My Collection', href: '/collection' }]
  },
  {
    title: 'A7',
    links: [{ label: '1-100', href: getParams({ type: 'A7', from: 0, to: 99 }) }]
  },
  {
    title: 'A6',
    links: [
      { label: '1-99', href: getParams({ type: 'A6', from: 0, to: 98 }) },
      { label: '100-199', href: getParams({ type: 'A6', from: 99, to: 198 }) },
      { label: '200-299', href: getParams({ type: 'A6', from: 199, to: 298 }) }
    ]
  },
  {
    title: 'A5',
    links: [
      { label: '1-99', href: getParams({ type: 'A5', from: 0, to: 98 }) },
      { label: '100-199', href: getParams({ type: 'A5', from: 99, to: 198 }) },
      { label: '200-299', href: getParams({ type: 'A5', from: 199, to: 298 }) }
    ]
  },
  {
    title: 'A4',
    links: [
      { label: '1-99', href: getParams({ type: 'A4', from: 0, to: 98 }) },
      { label: '100-199', href: getParams({ type: 'A4', from: 99, to: 198 }) },
      { label: '200-299', href: getParams({ type: 'A4', from: 199, to: 298 }) }
    ]
  },
  {
    title: 'Postal cards',
    links: [
      { label: '1-99', href: getParams({ type: 'postal-card', from: 0, to: 98 }) },
      { label: '100-199', href: getParams({ type: 'postal-card', from: 99, to: 198 }) },
      { label: '200-299', href: getParams({ type: 'postal-card', from: 199, to: 298 }) }
    ]
  }
] as const satisfies {
  title?: string;
  links: { label: string; href: string }[];
}[];

const BaseLayout = (props) => {
  const location = useLocation();
  createEffect(() => {
    fetchAcquiredState();
    fetchLibraryState();
  });

  return (
    <>
      <nav class="p-4 flex flex-col gap-2 border-r border-gray-200 h-screen sticky top-0">
        <div>pathname: {location.pathname}</div>
        <div>search: {location.search}</div>
        <div>key: {location.key}</div>
        <A href="/">Home</A>
        <For each={LINKS}>
          {(group) => (
            <div>
              <Show when={group.title} keyed>
                {(title) => <div>{title}</div>}
              </Show>

              <div class="flex flex-col">
                <For each={group.links}>{(link) => <A href={link.href}>{link.label}</A>}</For>
              </div>
            </div>
          )}
        </For>
      </nav>
      {props.children}
    </>
  );
};

export default BaseLayout;
