import { createAsyncStore, query, revalidate } from "@solidjs/router";

import type { UpdateProfile } from "@shared";

import { trpc } from "@renderer/libs/trpc";

const fetchProfile = query(() => {
  return trpc.profile.get.query();
}, "profile");

export const useProfile = () => {
  const profile = createAsyncStore(() => fetchProfile(), {
    initialValue: null,
  });

  const actions = {
    updateProfile: async (updates: UpdateProfile) => {
      await trpc.profile.update.mutate(updates);
      revalidate("profile");
    },
    updateProfilePicture: async (filePath: string) => {
      await trpc.profile.updatePicture.mutate({ filePath });
      revalidate("profile");
    },
  };

  return { profile, actions };
};
