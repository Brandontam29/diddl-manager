import AdmZip from "adm-zip";
import { logging } from "../../logging";
import { generateBackupReport } from "./generateReport";
import { validateFilePaths, filterValidFiles } from "./validateFiles";

export type ZipResult = {
  success: boolean;
  errors: string[];
};

export const createBackupZip = async (
  filePaths: string[],
  outputZipPath: string
): Promise<ZipResult> => {
  const zip = new AdmZip();
  const errors: string[] = [];
  const successful: string[] = [];
  const failed: { path: string; reason: string }[] = [];

  // 1. Validate existence
  const existenceChecks = await validateFilePaths(filePaths);

  // 2. Filter and track missing
  const validFiles = filterValidFiles(existenceChecks, (missingPath) => {
    const msg = `File does not exist: ${missingPath}`;
    logging.warn(msg);
    errors.push(msg);
    failed.push({ path: missingPath, reason: "File does not exist" });
  });

  if (validFiles.length === 0 && failed.length === 0) {
    const msg = "No files provided to zip.";
    logging.error(msg);
    return { success: false, errors: [msg] };
  }

  // 3. Add files to zip
  for (const filePath of validFiles) {
    try {
      zip.addLocalFile(filePath, "");
      successful.push(filePath);
    } catch (err) {
      const msg = `Failed to add ${filePath} to zip: ${err}`;
      logging.warn(msg);
      errors.push(msg);
      failed.push({ path: filePath, reason: String(err) });
    }
  }

  // 4. Generate and add report
  const reportContent = generateBackupReport({
    totalRequested: filePaths.length,
    successful,
    failed,
  });
  zip.addFile("backup_report.txt", Buffer.from(reportContent));

  // 5. Write to disk
  return new Promise((resolve) => {
    zip.writeZip(outputZipPath, (error) => {
      if (error) {
        const msg = `Zip writing failed at ${outputZipPath}: ${error}`;
        logging.error(msg);
        errors.push(msg);
        resolve({ success: false, errors });
      } else {
        logging.info(`Zip file created successfully at ${outputZipPath}`);
        resolve({ success: true, errors });
      }
    });
  });
};
