import { Component } from "solid-js";

import { Profile } from "@shared";

import { Button } from "@renderer/components/ui/button";

interface ProfileViewProps {
  profile: Profile;
  onEdit: () => void;
  onPictureUpload: (filePath: string) => void;
}

export const ProfileView: Component<ProfileViewProps> = (props) => {
  let fileInputRef: HTMLInputElement | undefined;

  const handlePictureClick = () => {
    fileInputRef?.click();
  };

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      // In Electron, File objects have a 'path' property
      const filePath = (file as any).path;
      if (filePath) {
        props.onPictureUpload(filePath);
      }
    }
  };

  return (
    <div class="flex flex-col gap-6 p-6">
      <div class="flex items-center gap-6">
        <div class="group relative cursor-pointer" onClick={handlePictureClick}>
          <div class="border-muted bg-muted/50 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4">
            {props.profile.picture ? (
              <img
                src={`diddl://user-images/${props.profile.picture.split(/[/\\]/).pop()}`}
                alt="Profile"
                class="h-full w-full object-cover"
              />
            ) : (
              <span class="text-muted-foreground text-4xl">?</span>
            )}
          </div>
          <div class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <span class="text-sm text-white">Upload</span>
          </div>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            class="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
        <div class="flex-1">
          <h1 class="text-3xl font-bold">{props.profile.name || "Unknown User"}</h1>
          <p class="text-muted-foreground">
            {props.profile.birthdate
              ? `Born: ${props.profile.birthdate}`
              : "No birthdate specified"}
          </p>
        </div>
        <div>
          <Button onClick={props.onEdit}>Edit Profile</Button>
        </div>
      </div>

      <div class="grid gap-4">
        <div>
          <h3 class="mb-2 border-b pb-2 text-lg font-semibold">Description</h3>
          <p class="whitespace-pre-wrap">
            {props.profile.description || "No description provided."}
          </p>
        </div>
        <div>
          <h3 class="mb-2 border-b pb-2 text-lg font-semibold">Hobbies</h3>
          <p class="whitespace-pre-wrap">{props.profile.hobbies || "No hobbies provided."}</p>
        </div>
      </div>
    </div>
  );
};
