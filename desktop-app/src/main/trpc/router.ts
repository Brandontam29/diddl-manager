import { configRouter } from "../config/router";
import { diddlRouter } from "../diddl/router";
import { fileSystemRouter } from "../file-system/router";
import { listRouter } from "../list/router";
import { profileRouter } from "../profile/router";
import { updaterRouter } from "../updater/router";
import { router } from "./trpc";

export const appRouter = router({
  diddl: diddlRouter,
  list: listRouter,
  config: configRouter,
  profile: profileRouter,
  fileSystem: fileSystemRouter,
  updater: updaterRouter,
});

export type AppRouter = typeof appRouter;
