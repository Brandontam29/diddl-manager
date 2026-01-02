import { app } from "electron";

const isDev = (): boolean => {
  return process.env["IS_DEV"] === undefined ? !app.isPackaged : process.env["IS_DEV"] === "true";
};
export default isDev;
