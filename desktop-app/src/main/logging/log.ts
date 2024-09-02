import { appendFile } from 'fs/promises';
import path from 'path';

import { logDirectory } from '../pathing';
import isExists from '../utils/isExists';
import ensureFileExists from '../utils/ensureFileExists';

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

function getQuarter(date: Date) {
  const month = date.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  return quarter;
}

// https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797
// const LOG_STYLE_MAP = {
//     info: 'font-size: 1rem; color: blue;',
//     warn: 'font-size: 1rem; color: yellow;',
//     error: 'font-size: 1rem; color: red;',
//     fatal: 'font-size: 1rem; color: red; padding: 4px; font-weight: bold;',
// } as const;

const logHandler = async (type: 'info' | 'warn' | 'error' | 'fatal', ...messages: any[]) => {
  const date = new Date();

  const quarter = getQuarter(date);

  const fileName = `LOGGING-Q${quarter}.log`;

  const filePath = path.join(logDirectory(), fileName);

  const isExist = await isExists(filePath);

  if (!isExist) await ensureFileExists(filePath);

  const prefix = `\n${formatDate(date)} [${type.toUpperCase()}]`;
  // Append text to the file
  try {
    const errIndices = messages.reduce<number[]>((acc, curr, index) => {
      if (curr instanceof Error) {
        acc.push(index);
      }
      return acc;
    }, []);

    for (let i = 0; i < messages.length; i++) {
      if (errIndices.includes(i) && i === 0) {
        appendFile(filePath, `${prefix} ${messages[i].message} ${messages[i].stack}`);
        console.log(`${prefix} ${messages[i].message} ${messages[i].stack}`);
        continue;
      }

      if (errIndices.includes(i)) {
        appendFile(filePath, `${messages[i].message} ${messages[i].stack}`);
        console.log(`${messages[i].message} ${messages[i].stack}`);

        continue;
      }

      if (i === 0) {
        appendFile(filePath, `${prefix} ${messages[i]}`);
        console.log(`${prefix} ${messages[i]}`);

        continue;
      }

      appendFile(filePath, `${messages[i]}`);
      console.log(`${messages[i]}`);
    }
  } catch (err) {
    if (err) {
      console.error('Error appending text to file:', err);
    }
  }
};

const log = {
  info: (...messages: (string | unknown)[]) => logHandler('info', ...messages),
  warn: (...messages: (string | unknown)[]) => logHandler('warn', ...messages),
  error: (...messages: (string | Error | unknown)[]) => logHandler('error', ...messages),
  fatal: (...messages: (string | unknown)[]) => logHandler('fatal', ...messages)
};

export default log;
