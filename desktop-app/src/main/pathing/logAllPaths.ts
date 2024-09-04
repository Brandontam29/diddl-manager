import {
  appPath,
  relativeDiddlImagesDirectory,
  diddlImagesDirectory,
  libraryPath,
  libraryMapPath,
  defaultLibraryPath,
  listDirectory,
  listTrackerPath,
  collectionListPath,
  logDirectory,
} from ".";

function logFunctionResult(func: (...args: any) => string, ...args: any) {
  const result = func(...args);
  console.log(`${func.name} => ${result}`);
  return result;
}

const logAllPaths = () => {
  const pathFunctions = [
    appPath,
    relativeDiddlImagesDirectory,
    diddlImagesDirectory,
    libraryPath,
    libraryMapPath,
    defaultLibraryPath,
    listDirectory,
    listTrackerPath,
    collectionListPath,
    logDirectory,
  ];

  pathFunctions.forEach((func) => logFunctionResult(func));
};

export default logAllPaths;
