import { appPath, diddlImagesPath, diddlImagesZipPath } from "../pathing";
import { logging } from "../logging";
import isExists from "../utils/isExists";
import AdmZip from "adm-zip";

const setupDiddlImages = async () => {
  const zipPath = diddlImagesZipPath();
  const outputFolder = diddlImagesPath();

  if (await isExists(outputFolder)) {
    logging.info("diddl-images directory already exists. No need to setup images");
    return;
  }
  try {
    const zip = new AdmZip(zipPath);

    zip.extractAllTo(appPath());

    logging.info(`Successfully unzipped '${zipPath}' to '${outputFolder}'`);
  } catch (e) {
    logging.info("Error unzipping file:", e);
  }
};

export default setupDiddlImages;
