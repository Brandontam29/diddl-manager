import { HashRouter, Route } from "@solidjs/router";
import { lazy } from "solid-js";
import { render } from "solid-js/web";

import { ToastList, ToastRegion } from "./components/ui/toast";
import BaseLayout from "./pages/layout";
import "./styles/index.css";

const HomePage = lazy(() => import("./pages/page"));
const NotFoundPage = lazy(() => import("./pages/not-found"));
const ListsPage = lazy(() => import("./pages/lists/page"));
const ListIdPage = lazy(() => import("./pages/lists/[id]"));
const SettingsPage = lazy(() => import("./pages/settings/page"));

render(
  () => (
    <HashRouter root={BaseLayout}>
      <Route path="/" component={HomePage} />
      <Route path="/lists" component={ListsPage} />
      <Route path="/lists/:id" component={ListIdPage} />
      <Route path="/settings" component={SettingsPage} />

      <Route path="*" component={NotFoundPage} />
      <ToastRegion>
        <ToastList />
      </ToastRegion>
    </HashRouter>
  ),
  document.querySelector("#root") as HTMLElement,
);
