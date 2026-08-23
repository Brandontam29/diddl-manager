import { createRootRoute, HeadContent, Scripts } from "@tanstack/solid-router";
import type { JSX } from "solid-js";
import { HydrationScript } from "solid-js/web";
import { ClerkProvider } from "@/lib/clerk-provider";
import { NotFound } from "@/components/NotFound";
import appCss from "@/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Diddl Manager" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
});

function RootDocument(props: { children: JSX.Element }) {
  return (
    <html lang="en" class="scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
      <head>
        <HydrationScript />
      </head>
      <body>
        <HeadContent />
        <ClerkProvider>{props.children}</ClerkProvider>
        <Scripts />
      </body>
    </html>
  );
}
