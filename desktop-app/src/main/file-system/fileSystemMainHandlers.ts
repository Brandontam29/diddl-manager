import { ipcMain } from 'electron';
import { writeFile } from 'fs/promises';

import getFileContent from './getFileContent';
import getFolderStructure, { type GetFolderStructureOptions } from './getFolderStructure';

export const GET_FOLDER_STRUCTURE = 'get-folder-structure';
export const GET_FILE_CONTENT = 'get-file-content';
export const EDIT_FILE_CONTENT = 'edit-file-content';

const fileSystemMainHandlers = () => {
  ipcMain.handle(
    GET_FOLDER_STRUCTURE,
    (_event, path: string, options?: GetFolderStructureOptions) => {
      return getFolderStructure(path, options);
    }
  );
  ipcMain.handle(GET_FILE_CONTENT, (_event, path: string) => {
    return getFileContent(path);
  });

  ipcMain.handle(EDIT_FILE_CONTENT, (_event, path: string, content: string) => {
    writeFile(path, content);
  });
};

export default fileSystemMainHandlers;
