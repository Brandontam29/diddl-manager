import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { updateProfileSchema } from "../../shared";
import { logging } from "../logging";
import { userImagesPath } from "../pathing";
import { publicProcedure, router } from "../trpc/trpc";

const defaultProfile = {
  name: "",
  birthdate: "",
  description: "",
  hobbies: "",
};

export const profileRouter = router({
  get: publicProcedure.query(async ({ ctx }) => {
    try {
      const profile = await ctx.db
        .selectFrom("profile")
        .selectAll()
        .orderBy("id", (ob) => ob.desc().nullsFirst())
        .limit(1)
        .executeTakeFirst();

      if (!profile) {
        return null;
      }

      return profile;
    } catch (e) {
      logging.error(`Error fetching profile: ${e}`);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch profile" });
    }
  }),

  update: publicProcedure.input(updateProfileSchema).mutation(async ({ ctx, input }) => {
    try {
      const existingProfile = await ctx.db
        .selectFrom("profile")
        .select("id")
        .limit(1)
        .executeTakeFirst();

      if (!existingProfile) {
        const profile = await ctx.db
          .insertInto("profile")
          .values({ ...defaultProfile, ...input })
          .returningAll()
          .executeTakeFirstOrThrow();

        return profile;
      }

      const profile = await ctx.db
        .updateTable("profile")
        .set({ ...input })
        .where("id", "=", existingProfile.id)
        .executeTakeFirstOrThrow();

      return profile;
    } catch (e) {
      logging.error(`Error updating user profile: ${e}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update profile",
      });
    }
  }),

  updatePicture: publicProcedure
    .input(z.object({ filePath: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        const userImagesDir = userImagesPath();
        await mkdir(userImagesDir, { recursive: true });

        const ext = path.extname(input.filePath);
        const newFileName = `profile_${Date.now()}${ext}`;
        const destPath = path.join(userImagesDir, newFileName);

        await copyFile(input.filePath, destPath);

        return { path: destPath };
      } catch (e) {
        logging.error(`Error updating user picture: ${e}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile picture",
        });
      }
    }),
});
