import { rm } from "node:fs/promises";

import { TRPCError } from "@trpc/server";

import { logging } from "../logging";
import { diddlImagesPath } from "../pathing";
import { publicProcedure, router } from "../trpc/trpc";
import setupDiddlImages from "./setupDiddlImages";

export const diddlRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const diddls = await ctx.db
      .selectFrom("diddl")
      .select([
        "diddl.id",
        "diddl.name",
        "diddl.type",
        "diddl.imagePath",
        "diddl.imageWidth",
        "diddl.imageHeight",
      ])
      .execute();

    return diddls;
  }),

  fixImages: publicProcedure.mutation(async () => {
    try {
      await rm(diddlImagesPath(), { recursive: true, force: true });
      logging.info(`Directory ${diddlImagesPath()} deleted successfully.`);
    } catch (err) {
      logging.error(`Error deleting directory: ${String(err)}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete diddl images directory",
      });
    }

    await setupDiddlImages();
    return { success: true };
  }),
});
