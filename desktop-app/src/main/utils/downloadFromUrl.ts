import { app } from 'electron';
import { createWriteStream } from 'fs';
import { mkdir, rm } from 'fs/promises';
import https from 'https';
import path from 'path';

const downloadFromUrl = async (url: string, options?: { downloadPath?: string }) => {
  const username = 'quantum-client';
  const password = 'Forge-Simulator';

  const isFile = !!path.basename(url);

  const downloadPathSpecifiesFileName =
    !!options?.downloadPath && !!path.basename(options?.downloadPath);

  const finalDirectory = options?.downloadPath
    ? path.dirname(options.downloadPath)
    : app.getPath('userData');

  const finalFileName = downloadPathSpecifiesFileName // @ts-ignore ts not smart enough
    ? path.basename(options.downloadPath)
    : path.basename(url);

  const finalDownloadPath = isFile ? path.join(finalDirectory, finalFileName) : finalDirectory;

  try {
    await mkdir(finalDirectory);
  } catch (e) {}

  const file = createWriteStream(finalDownloadPath, { flags: 'w' });

  const httpsOptions = {
    auth: `${username}:${password}`
  };

  return new Promise<string>((resolve, reject) => {
    https
      .get(url, httpsOptions, (response) => {
        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve(finalDownloadPath);
        });
        file.on('error', (err) => {
          rm(finalDownloadPath);
          reject(err);
        });
      })
      .on('error', (err) => {
        rm(finalDownloadPath);
        reject(err);
      });
  });
};

export default downloadFromUrl;
