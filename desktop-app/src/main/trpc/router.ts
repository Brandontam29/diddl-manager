import { configRouter } from "./routers/config";
import { diddlRouter } from "./routers/diddl";
import { fileSystemRouter } from "./routers/file-system";
import { listRouter } from "./routers/list";
import { profileRouter } from "./routers/profile";
import { router } from "./trpc";

export const appRouter = router({
  diddl: diddlRouter,
  list: listRouter,
  config: configRouter,
  profile: profileRouter,
  fileSystem: fileSystemRouter,
});

export type AppRouter = typeof appRouter;
