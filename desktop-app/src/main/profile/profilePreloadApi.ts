import { ipcRenderer } from "electron";

import { Profile, UpdateProfile } from "../../shared";
import { GET_USER_PROFILE, UPDATE_USER_PICTURE, UPDATE_USER_PROFILE } from "./profileMainHandlers";

export const profilePreloadApi = {
  getProfile: (): Promise<Profile | null> => ipcRenderer.invoke(GET_USER_PROFILE),
  updateProfile: (data: UpdateProfile) => ipcRenderer.invoke(UPDATE_USER_PROFILE, data),
  updateProfilePicture: (filePath: string) => ipcRenderer.invoke(UPDATE_USER_PICTURE, filePath),
};

export default profilePreloadApi;
