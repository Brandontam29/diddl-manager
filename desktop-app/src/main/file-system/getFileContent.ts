import { readFile } from 'fs/promises';
import path from 'path';

const textExtensions = [
  '.txt',
  '.md',
  '.js',
  '.json',
  '.html',
  '.css',
  '.xml',
  '.csv',
  '.cif',
  '.xyz',
  '.input',
  '.tp',
  '.out'
];

function isTextFile(filename: string) {
  if (path.extname(filename).includes('.tp')) return true;

  return textExtensions.includes(path.extname(filename).toLowerCase());
}

const getFileContent = async (path: string) => {
  if (!isTextFile(path)) {
    throw new Error('Cannot read file that is not text based');
  }

  try {
    const result = await readFile(path, 'utf8');

    return result;
  } catch (e) {
    throw new Error('Sorry, there was a problem reading your file');
  }
};

export default getFileContent;
