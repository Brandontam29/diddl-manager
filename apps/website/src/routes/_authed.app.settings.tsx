import { createFileRoute } from "@tanstack/solid-router";

import SettingsSectionAccount from "@/features/settings/components/SettingsSectionAccount";
import SettingsSectionProfile from "@/features/settings/components/SettingsSectionProfile";
import SettingsSectionUx from "@/features/settings/components/SettingsSectionUx";

/** The desktop settings page minus the updater and dev cards, plus the Account card (spec §6). */
export const Route = createFileRoute("/_authed/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div class="mx-auto w-full max-w-screen-xl grow space-y-8 px-4 py-8 max-md:pt-14">
      <h1 class="text-2xl font-bold">User Settings</h1>
      <SettingsSectionProfile />
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SettingsSectionUx />
      </div>
      <SettingsSectionAccount />
    </div>
  );
}
