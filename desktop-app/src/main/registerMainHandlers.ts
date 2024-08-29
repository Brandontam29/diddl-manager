import { BrowserWindow } from 'electron';
import { fileSystemMainHandlers } from './file-system';
import { libraryMainHandlers } from './library';
import { wishlistMainHandlers } from './wishlist';
import { acquiredMainHandlers } from './acquired';

const registerMainHandlers = (browserWindow: BrowserWindow): void => {
  fileSystemMainHandlers();
  libraryMainHandlers();
  wishlistMainHandlers();
  acquiredMainHandlers();
};

export default registerMainHandlers;
