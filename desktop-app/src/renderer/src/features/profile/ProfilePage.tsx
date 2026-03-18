import { Component, Show, createSignal } from "solid-js";

import { ProfileEdit } from "./ProfileEdit";
import { ProfileView } from "./ProfileView";
import { useProfile } from "./profile-state";

export const ProfilePage: Component = () => {
  const { profile, actions } = useProfile();
  const [isEditing, setIsEditing] = createSignal(false);

  const handleSave = async (updates: any) => {
    await actions.updateProfile(updates);
    setIsEditing(false);
  };

  const handlePictureUpload = async (filePath: string) => {
    await actions.updateProfilePicture(filePath);
  };

  return (
    <div class="bg-background text-foreground h-full w-full overflow-y-auto">
      <Show when={profile()} fallback={<div class="p-6">Loading profile...</div>}>
        {(userProfile) => (
          <Show
            when={isEditing()}
            fallback={
              <ProfileView
                profile={userProfile()}
                onEdit={() => setIsEditing(true)}
                onPictureUpload={handlePictureUpload}
              />
            }
          >
            <ProfileEdit
              profile={userProfile()}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          </Show>
        )}
      </Show>
    </div>
  );
};
