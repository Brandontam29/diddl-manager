import {
  rawGet__dirname,
  rawGetAppData,
  rawGetPathAppData,
  rawGetPathUserData,
  rawGetPathDownloads,
  appPath,
  relativeDiddlImagesDirectory,
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
    relativeDiddlImagesDirectory,
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
  ];

  pathFunctions.forEach((func) => logFunctionResult(func));
};

export default logAllPaths;
