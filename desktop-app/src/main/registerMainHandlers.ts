import { BrowserWindow } from 'electron';
import { fileSystemMainHandlers } from './file-system';
import { libraryMainHandlers } from './library';
import { listMainHandlers } from './list';
import { acquiredMainHandlers } from './acquired';

const registerMainHandlers = (browserWindow: BrowserWindow): void => {
  fileSystemMainHandlers();
  libraryMainHandlers();
  listMainHandlers(browserWindow);
  acquiredMainHandlers();
};

export default registerMainHandlers;
