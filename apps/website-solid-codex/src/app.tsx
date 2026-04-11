import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import Nav from "~/components/Nav";
import { ClerkProvider } from "~/lib/clerk";
import { ConvexProvider } from "~/lib/convex/client";
import "./app.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <ClerkProvider>
          <ConvexProvider>
            <div class="page-shell">
              <Nav />
              <Suspense>{props.children}</Suspense>
            </div>
          </ConvexProvider>
        </ClerkProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
