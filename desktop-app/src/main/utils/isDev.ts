import { app } from 'electron';

const isDev = (): boolean => {
  return process.env['IS_DEV'] !== undefined ? process.env['IS_DEV'] === 'true' : !app.isPackaged;
};
export default isDev;
