// import SecretMigrationButton from "./components/SecretMigrationButton";
import SettingsSectionDev from "./components/SettingsSectionDev";
import SettingsSectionProfile from "./components/SettingsSectionProfile";
import SettingsSectionUpdater from "./components/SettingsSectionUpdater";
import SettingsSectionUx from "./components/SettingsSectionUx";

const SettingsPage = () => {
  return (
    <div class="mx-auto max-w-screen-xl grow px-4 py-8">
      <SettingsSectionUx />
      <SettingsSectionUpdater />
      <SettingsSectionDev />
      {/* <SecretMigrationButton /> */}
      <SettingsSectionProfile />
    </div>
  );
};

export default SettingsPage;
