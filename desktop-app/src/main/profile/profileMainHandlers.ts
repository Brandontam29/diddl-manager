import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { ipcMain } from "electron";
import { ResultAsync, err, ok } from "neverthrow";

import { UpdateProfile, updateProfileSchema } from "../../shared";
import { MyDatabase } from "../database";
import { logging } from "../logging";
import { userImagesPath } from "../pathing";

export const GET_USER_PROFILE = "get-user-profile";
export const UPDATE_USER_PROFILE = "update-user-profile";
export const UPDATE_USER_PICTURE = "update-user-picture";

const defaultProfile = {
  name: "",
  birthdate: "",
  description: "",
  hobbies: "",
};

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)));

const profileMainHandlers = (db: MyDatabase) => {
  ipcMain.handle(GET_USER_PROFILE, (_event) => {
    const result = ResultAsync.fromPromise(
      db
        .selectFrom("profile")
        .selectAll()
        .orderBy("id", (ob) => ob.desc().nullsFirst())
        .limit(1)
        .executeTakeFirst(),
      toError,
    )
      .andThen((profile) => {
        if (!profile) {
          return err(new Error("No user profile found"));
        }
        return ok(profile);
      })
      .mapErr((error) => {
        logging.error(`Error: ${error.message}`);
        return error;
      })
      .match(
        (profile) => ({ success: true, data: profile }),
        (error) => ({
          success: false,
          error: `${error}`,
        }),
      );

    return result;
  });

  ipcMain.handle(UPDATE_USER_PROFILE, async (_event, payload: UpdateProfile) => {
    const payloadResult = updateProfileSchema.safeParse(payload);

    if (!payloadResult.success) return { success: false, error: "Payload is bad" };

    const { data: profileData } = payloadResult;
    try {
      const existingProfile = await db
        .selectFrom("profile")
        .select("id")
        .limit(1)
        .executeTakeFirst();

      if (!existingProfile) {
        const profile = await db
          .insertInto("profile")
          .values({ ...defaultProfile, ...profileData })
          .returningAll()
          .executeTakeFirstOrThrow();

        return { success: true, data: profile };
      }

      const profile = await db
        .updateTable("profile")
        .set({
          ...profileData,
        })
        .where("id", "=", existingProfile.id)
        .executeTakeFirstOrThrow();

      return { success: true, data: profile };
    } catch (err) {
      logging.error(`Error updating user profile: ${err}`);
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle(UPDATE_USER_PICTURE, async (_event, filePath: string) => {
    try {
      if (!filePath) return { success: false, error: "No file path provided" };

      const userImagesDir = userImagesPath();
      await mkdir(userImagesDir, { recursive: true });

      const ext = path.extname(filePath);
      const newFileName = `profile_${Date.now()}${ext}`;
      const destPath = path.join(userImagesDir, newFileName);

      await copyFile(filePath, destPath);

      return { success: true, path: destPath };
    } catch (err) {
      logging.error(`Error updating user picture: ${err}`);
      return { success: false, error: String(err) };
    }
  });
};

export default profileMainHandlers;
