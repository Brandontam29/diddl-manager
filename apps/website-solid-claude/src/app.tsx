import { Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { MetaProvider, Title } from "@solidjs/meta";
import { ClerkProvider } from "clerk-solidjs";
import { ColorModeProvider, ColorModeScript, cookieStorageManagerSSR } from "@kobalte/core";
import { setupConvex, ConvexProvider } from "convex-solidjs";
import { getCookie } from "@solidjs/start/http";

import Nav from "~/components/nav";

import "@fontsource/inter";
import "./app.css";

function getServerCookies() {
  "use server";
  const colorMode = getCookie("kb-color-mode");
  return colorMode ? `kb-color-mode=${colorMode}` : "";
}

export default function App() {
  const storageManager = cookieStorageManagerSSR(isServer ? getServerCookies() : document.cookie);

  const convex = setupConvex(import.meta.env.VITE_CONVEX_URL);

  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Website Solid Claude</Title>
          <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
            <ConvexProvider client={convex}>
              <ColorModeScript storageType={storageManager.type} />
              <ColorModeProvider storageManager={storageManager}>
                <Nav />
                <main class="container mx-auto px-4 py-8">
                  <Suspense
                    fallback={
                      <div class="flex min-h-[50vh] items-center justify-center">
                        <div class="animate-pulse text-muted-foreground">Loading...</div>
                      </div>
                    }
                  >
                    {props.children}
                  </Suspense>
                </main>
              </ColorModeProvider>
            </ConvexProvider>
          </ClerkProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
