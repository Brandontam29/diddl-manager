import exists from "../../utils/exists";

export type FileStatus = {
  path: string;
  exists: boolean;
};

export const validateFilePaths = (filePaths: string[]) => {
  return Promise.all(filePaths.map(async (p) => ({ path: p, exists: await exists(p) })));
};

export const filterValidFiles = (checks: FileStatus[], onMissing: (path: string) => void) => {
  checks.forEach((f) => {
    if (!f.exists) {
      onMissing(f.path);
    }
  });

  return checks.filter((f) => f.exists).map((f) => f.path);
};
