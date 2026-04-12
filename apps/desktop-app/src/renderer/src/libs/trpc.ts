import type { CreateTRPCProxyClient } from "@trpc/client";
import { createTRPCProxyClient } from "@trpc/client";
import { ipcLink } from "electron-trpc/renderer";

import type { AppRouter } from "../../../main/trpc/router";

export const trpc: CreateTRPCProxyClient<AppRouter> = createTRPCProxyClient<AppRouter>({
  links: [ipcLink()],
});
