import { appPath, logDirectory, libraryPath, defaultLibraryPath, diddlImagesDirectory } from '.';

function logFunctionResult(func: (...args: any) => string, ...args: any) {
  const result = func(...args);
  console.log(`${func.name} => ${result}`);
  return result;
}

const logAllPaths = () => {
  const pathFunctions = [
    appPath,
    logDirectory,
    libraryPath,
    defaultLibraryPath,
    diddlImagesDirectory
  ];

  pathFunctions.forEach((func) => logFunctionResult(func));
};

export default logAllPaths;
