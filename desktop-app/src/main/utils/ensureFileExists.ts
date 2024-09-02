import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { logging } from '../logging';

const ensureFileExists = async (filePath: string, defaultContent = '') => {
  const dir = path.dirname(filePath);

  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if (!(err instanceof Error)) return logging.error(`Error creating directories: ${err}`);

    return logging.error(`Error creating directories: ${err.message}`);
  }
  try {
    await writeFile(filePath, defaultContent);
  } catch (err) {
    if (!(err instanceof Error)) return logging.error(`Error creating file: ${err}`);

    return logging.error(`Error creating file: ${err.message}`);
  }
};

export default ensureFileExists;
