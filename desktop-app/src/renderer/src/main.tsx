import "./styles/index.css";

import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import { lazy } from "solid-js";
import BaseLayout from "./pages/layout";
import { ToastList, ToastRegion } from "./components/ui/toast";
const HomePage = lazy(() => import("./pages/page"));
const NotFoundPage = lazy(() => import("./pages/not-found"));
const ListsPage = lazy(() => import("./pages/lists/page"));
const ListIdPage = lazy(() => import("./pages/lists/[id]"));

render(
  () => (
    <Router root={BaseLayout}>
      <Route path="/" component={HomePage} />
      <Route path="/lists" component={ListsPage} />
      <Route path="/lists/:id" component={ListIdPage} />

      <Route path="*" component={NotFoundPage} />
      <ToastRegion>
        <ToastList />
      </ToastRegion>
    </Router>
  ),
  document.getElementById("root") as HTMLElement,
);
