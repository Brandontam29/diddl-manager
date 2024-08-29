import { app } from 'electron';
import path from 'path';

import isDev from '../utils/isDev';
import logAllPaths from './logAllPaths';

const DEV_DIRECTORY = 'diddl-manager-solid-dev';
/**
 * BASE
 */
export const appPath = () =>
  isDev() ? path.join(app.getPath('appData'), DEV_DIRECTORY) : app.getPath('userData');

export const relativeDiddlImagesDirectory = () => path.join('assets', 'diddl-images');
export const diddlImagesDirectory = () => path.join(app.getAppPath(), 'diddl-images');

export const libraryPath = () => path.join(appPath(), 'library.json');
export const libraryMapPath = () => path.join(appPath(), 'library-map.json');

export const defaultLibraryPath = () =>
  path.join(app.getAppPath(), 'resources', 'default-library.json');

export const wishlistPath = () => path.join(appPath(), 'wishlist.json');
export const acquiredListPath = () => path.join(appPath(), 'acquired-list.json');

export const logDirectory = () => path.join(appPath(), 'logs');

export { logAllPaths };
