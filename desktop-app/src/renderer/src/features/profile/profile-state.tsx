import { action, createAsync, query, revalidate } from "@solidjs/router";
import { ParentComponent, Resource, createContext, useContext } from "solid-js";

import { Profile, UpdateProfile } from "@shared";

type UserContextValue = {
  profile: Resource<Profile | null | undefined>;
  actions: {
    refetchProfile: typeof refetchProfile;
    updateProfile: typeof updateProfile;
    updateProfilePicture: typeof updateProfilePicture;
  };
};

export const fetchProfile = query(async () => {
  const result = await window.api.getProfile();
  // Handling { success, data, error } from IPC or fallback
  if (result && typeof result === "object" && "success" in result) {
    if (result.success && result.data) {
      return result.data as Profile;
    }
    return null;
  }
  // Fallback if it matches the preload API signature instead
  return result as Profile | null;
}, "profile");

export const refetchProfile = () => {
  revalidate("profile");
};

export const updateProfile = action(async (updates: UpdateProfile) => {
  const result = await window.api.updateProfile(updates);
  if (result && typeof result === "object" && "success" in result && result.success) {
    revalidate("profile");
    return true;
  }
  return false;
}, "updateProfile");

export const updateProfilePicture = action(async (filePath: string) => {
  const result = await window.api.updateProfilePicture(filePath);
  if (result && typeof result === "object" && "success" in result && result.success) {
    revalidate("profile");
    return true;
  }
  return false;
}, "updateProfilePicture");

const UserContext = createContext<UserContextValue>();

export const UserProvider: ParentComponent = (props) => {
  const profile = createAsync(() => fetchProfile());

  return (
    <UserContext.Provider
      value={{ profile, actions: { refetchProfile, updateProfile, updateProfilePicture } }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useProfile must be used within a UserProvider");
  }
  return context;
};
