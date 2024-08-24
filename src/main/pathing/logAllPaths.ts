import {
  appPath,
  logDirectory,
  libraryPath,
  defaultLibraryPath,
  relativeDiddlImagesDirectory
} from '.';

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
    relativeDiddlImagesDirectory
  ];

  pathFunctions.forEach((func) => logFunctionResult(func));
};

export default logAllPaths;
