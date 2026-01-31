// UserContext.tsx
import { createAsync } from "@solidjs/router";
import { ParentComponent, Resource, createContext, useContext } from "solid-js";

import { Profile } from "@shared";

type UserContextValue = {
  profile: Resource<Profile>;
  actions: {
    refetchProfile: typeof refetchProfile;
    updateProfile: typeof updateProfile;
  };
};

const fetchProfile = () => {
  return window.api.getProfile();
};

const refetchProfile = () => {
  return window.api.getProfile();
};

const updateProfile = (updates: Partial<Profile>) => {};

const UserContext = createContext<UserContextValue>();

export const UserProvider: ParentComponent = (props) => {
  const profile = createAsync(() => fetchProfile());

  return (
    <UserContext.Provider value={{ profile, actions: { refetchProfile, updateProfile } }}>
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
