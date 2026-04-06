import { rename } from "node:fs/promises";
import path from "path";

import { z } from "zod";

import { notFoundError, toTrpcError } from "../errors";
import { logging } from "../logging";
import { defaultZipPath, downloadsFolder } from "../pathing";
import { publicProcedure, router } from "../trpc/trpc";
import { createBackupZip } from "./zip/createBackupZip";

export const fileSystemRouter = router({
  downloadImages: publicProcedure
    .input(z.object({ diddlIds: z.array(z.number()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const imagePaths = await ctx.db
          .selectFrom("diddl")
          .select(["diddl.imagePath"])
          .where("diddl.id", "in", input.diddlIds)
          .execute();

        if (imagePaths.length === 0) {
          throw notFoundError("No images were found for the selected Diddls", {
            diddlIds: input.diddlIds,
          });
        }

        const timestamp = new Date().toISOString().replaceAll(":", "-");
        const zipFilename = `diddl-images-${imagePaths.length}-${timestamp}.zip`;
        const zipFilePath = defaultZipPath(zipFilename);

        const result = await createBackupZip(
          imagePaths.map((imgPath) => imgPath.imagePath),
          zipFilePath,
        );

        if (!result.success) {
          throw new Error(result.errors.join("\n") || "Zip creation failed");
        }

        const destPath = path.join(downloadsFolder(), zipFilename);
        await rename(zipFilePath, destPath);
        logging.info(`moved ${zipFilePath} to ${destPath}`);

        return { success: true as const };
      } catch (error) {
        throw toTrpcError(error, {
          fallbackMessage: "Failed to create zip file",
          operation: "fileSystem.downloadImages",
          details: { diddlIds: input.diddlIds },
        });
      }
    }),
});
