import { readFile, rename, writeFile } from 'fs/promises';
import { acquiredItemSchema } from '../../shared';
import { appPath, acquiredListPath } from '../pathing';
import isExists from '../utils/isExists';
import path from 'path';
import { logging } from '../logging';

const acquiredListBackupPath = () =>
  path.join(appPath(), `${new Date().toISOString()}-acquired-list.json`);

const createDefaultAcquiredList = async () => {
  writeFile(acquiredListPath(), '[]');
};

const setupAcquiredList = async () => {
  if (!(await isExists(acquiredListPath()))) {
    logging.info('acquiredList.json not found. Creating new acquiredList.json.');
    createDefaultAcquiredList();

    return;
  }

  const rawAcquiredList = await readFile(acquiredListPath(), 'utf8');

  try {
    const acquiredList = JSON.parse(rawAcquiredList);

    acquiredItemSchema.array().parse(acquiredList);
    logging.info('Found acquiredList.json. Data is valid.');
  } catch (err) {
    logging.error(
      `Acquired List corrupted. Backing up Acquired List to ${acquiredListBackupPath()}`
    );
    await rename(acquiredListPath(), acquiredListBackupPath());
    createDefaultAcquiredList();
  }
};

export default setupAcquiredList;
