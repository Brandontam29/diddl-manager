// import SettingsSectionProfile from "./components/SettingsSectionProfile";
// import SecretMigrationButton from "./components/SecretMigrationButton";
import SettingsSectionDev from "./components/SettingsSectionDev";
import SettingsSectionUx from "./components/SettingsSectionUx";

const SettingsPage = () => {
  return (
    <div class="mx-auto max-w-screen-xl grow px-4 py-8">
      <SettingsSectionUx />
      <SettingsSectionDev />
      {/* <SecretMigrationButton /> */}
      {/* <SettingsSectionProfile /> */}
    </div>
  );
};

export default SettingsPage;
