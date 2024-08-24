import { readFile, rename, writeFile } from 'fs/promises';
import { libraryEntrySchema } from '../../shared/library-models';
import { appPath, defaultLibraryPath, relativeDiddlImagesDirectory, libraryPath } from '../pathing';
import isExists from '../utils/isExists';
import path from 'path';
import { logging } from '../logging';

const libraryBackupPath = () => path.join(appPath(), `${new Date().toISOString()}-library.json`);

const createDefaultLibrary = async () => {
  const rawLibrary = await readFile(defaultLibraryPath(), 'utf8');

  const library = JSON.parse(rawLibrary);

  const wellPathedLibrary = library.map((entry) => ({
    ...entry,
    imagePath: path.join(relativeDiddlImagesDirectory(), entry.imagePath)
  }));

  writeFile(libraryPath(), JSON.stringify(wellPathedLibrary));
};

const setupLibrary = async () => {
  if (!(await isExists(libraryPath()))) {
    logging.info('library.json not found. Creating new library.json.');
    createDefaultLibrary();

    return;
  }

  const rawLibrary = await readFile(libraryPath(), 'utf8');

  try {
    const library = JSON.parse(rawLibrary);

    libraryEntrySchema.array().parse(library);
    logging.info('Found library.json. Data is valid.');
  } catch (err) {
    logging.error(`Library corrupted. Backing up Library to ${libraryBackupPath()}`);
    await rename(libraryPath(), libraryBackupPath());
    createDefaultLibrary();
  }
};

export default setupLibrary;
