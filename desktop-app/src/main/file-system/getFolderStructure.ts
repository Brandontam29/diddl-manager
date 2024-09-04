import fs, { type Dirent, readdirSync } from "fs";
import path from "path";

export type FileRender = { name: string; path: string } & (
  | { isFile: true }
  | {
      isFile: false;
      children: FileRender[];
    }
);

const direntToFile = (dirent: Dirent): FileRender => {
  return dirent.isDirectory()
    ? {
        isFile: false,
        name: dirent.name,
        path: dirent.path,
        children: [],
      }
    : {
        isFile: true,
        name: dirent.name,
        path: dirent.path,
      };
};

export type GetFolderStructureOptions = {
  recursive?: boolean;
};

function readDirSyncRecursive(directoryPath: string) {
  const filesList: FileRender[] = [];

  const items = fs.readdirSync(directoryPath, { withFileTypes: true });

  items.forEach((item) => {
    const itemPath = path.join(directoryPath, item.name);

    const fileRender = direntToFile(item);
    if (fileRender.isFile) {
      filesList.push(direntToFile(item));
    } else {
      fileRender.children = readDirSyncRecursive(itemPath);

      filesList.push(fileRender);
    }
  });

  return filesList;
}

const getFolderStructure = (path: string, options?: GetFolderStructureOptions) => {
  const folderStructure = options?.recursive ? readDirSyncRecursive(path) : readdirSync(path);

  return folderStructure;
};

export default getFolderStructure;
