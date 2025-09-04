import {
  rawGet__dirname,
  rawGetAppData,
  rawGetPathAppData,
  rawGetPathUserData,
  rawGetPathDownloads,
  appPath,
  rendererDirectory,
  libraryPath,
  libraryMapPath,
  defaultLibraryPath,
  listDirectory,
  listTrackerPath,
  collectionListPath,
  logDirectory,
  defaultZipPath,
  downloadsFolder,
  diddlImagesPath,
  diddlImagesZipPath,
} from ".";

function logFunctionResult(func: (...args: any) => string, ...args: any) {
  const result = func(...args);
  console.log(`${func.name} => ${result}`);
  return result;
}

const logAllPaths = () => {
  const pathFunctions = [
    rawGet__dirname,
    rawGetAppData,
    rawGetPathAppData,
    rawGetPathUserData,
    rawGetPathDownloads,
    appPath,
    rendererDirectory,
    libraryPath,
    libraryMapPath,
    defaultLibraryPath,
    listDirectory,
    listTrackerPath,
    collectionListPath,
    logDirectory,
    defaultZipPath,
    downloadsFolder,
    diddlImagesZipPath,
    diddlImagesPath,
  ];

  pathFunctions.forEach((func) => logFunctionResult(func));
};

export default logAllPaths;
