import { readFile, rename, writeFile } from 'fs/promises';
import { acquiredItemSchema } from '../../shared';
import { appPath, acquiredListPath } from '../pathing';
import isExists from '../utils/isExists';
import path from 'path';
import { logging } from '../logging';
import ensureFileExists from '../utils/ensureFileExists';

const acquiredListBackupPath = () =>
  path.join(appPath(), `${new Date().toISOString()}-acquired-list.json`);

const setupAcquiredList = async () => {
  const fileExists = await isExists(acquiredListPath());

  if (!fileExists) {
    logging.info('acquired-list.json not found. Creating new acquired-list.json.');
    await ensureFileExists(acquiredListPath(), '[]');

    return;
  }

  try {
    const rawAcquiredList = await readFile(acquiredListPath(), 'utf8');

    const acquiredList = JSON.parse(rawAcquiredList);

    acquiredItemSchema.array().parse(acquiredList);
    logging.info('Found acquired-list.json. Data is valid.');
  } catch (err) {
    logging.error(
      `Acquired List corrupted. Backing up Acquired List to ${acquiredListBackupPath()}`
    );
    await rename(acquiredListPath(), acquiredListBackupPath());
    await ensureFileExists(acquiredListPath(), '[]');
  }
};

export default setupAcquiredList;
