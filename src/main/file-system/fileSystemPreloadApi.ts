import { ipcRenderer } from 'electron';

import {
    EDIT_FILE_CONTENT,
    GET_FILE_CONTENT,
    GET_FOLDER_STRUCTURE,
} from './fileSystemMainHandlers';
import { GetFolderStructureOptions } from './getFolderStructure';

const fileSystemPreloadApi = {
    getFolderStructure: (path: string, option?: GetFolderStructureOptions) =>
        ipcRenderer.invoke(GET_FOLDER_STRUCTURE, path, option),
    getFileContent: (path: string): Promise<string> =>
        ipcRenderer.invoke(GET_FILE_CONTENT, path),
    editFileContent: (path: string, content: string): Promise<string> =>
        ipcRenderer.invoke(EDIT_FILE_CONTENT, path, content),
};

export default fileSystemPreloadApi;
