import { rm } from "node:fs/promises";

import { toTrpcError } from "../errors";
import { diddlImagesPath } from "../pathing";
import { publicProcedure, router } from "../trpc/trpc";
import setupDiddlImages from "./setupDiddlImages";

export const diddlRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
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
    } catch (e) {
      throw toTrpcError(e, {
        fallbackMessage: "Failed to fetch diddls",
        operation: "diddl.getAll",
      });
    }
  }),

  fixImages: publicProcedure.mutation(async () => {
    try {
      await rm(diddlImagesPath(), { recursive: true, force: true });
    } catch (err) {
      throw toTrpcError(err, {
        fallbackMessage: "Failed to delete diddl images directory",
        operation: "diddl.fixImages",
        details: { imagePath: diddlImagesPath() },
      });
    }

    try {
      await setupDiddlImages();
      return { success: true };
    } catch (error) {
      throw toTrpcError(error, {
        fallbackMessage: "Failed to rebuild diddl images directory",
        operation: "diddl.fixImages",
        details: { imagePath: diddlImagesPath() },
      });
    }
  }),
});
