import SettingsSectionProfile from "./components/SettingsSectionProfile";
import SettingsSectionUpdater from "./components/SettingsSectionUpdater";
import SettingsSectionUx from "./components/SettingsSectionUx";

const SettingsPage = () => {
  return (
    <div class="mx-auto max-w-screen-xl grow space-y-8 px-4 py-8">
      <h1 class="text-2xl font-bold">User Settings</h1>
      <SettingsSectionProfile />
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SettingsSectionUx />
        <SettingsSectionUpdater />
      </div>
    </div>
  );
};

export default SettingsPage;
