// import {
//   rawGet__dirname,
//   rawGetAppData,
//   rawGetPathAppData,
//   rawGetPathUserData,
//   rawGetPathDownloads,
//   appPath,
//   rendererDirectory,
//   dbPath,
//   logDirectory,
//   defaultZipPath,
//   downloadsFolder,
//   diddlImagesZipPath,
//   diddlImagesPath,
// } from ".";

// function logFunctionResult(func: (...args: any) => string, ...args: any) {
//   const result = func(...args);
//   console.log(`${func.name} => ${result}`);
//   return result;
// }

// const logAllPaths = () => {
//   const pathFunctions = [
//     rawGet__dirname,
//     rawGetAppData,
//     rawGetPathAppData,
//     rawGetPathUserData,
//     rawGetPathDownloads,
//     appPath,
//     rendererDirectory,
//     dbPath,
//     logDirectory,
//     defaultZipPath,
//     downloadsFolder,
//     diddlImagesZipPath,
//     diddlImagesPath,
//   ];

//   pathFunctions.forEach((func) => logFunctionResult(func));
// };

// export default logAllPaths;

import * as paths from ".";

function logFunctionResult(func: (...args: any) => string, ...args: any) {
  try {
    const result = func(...args);
    console.log(`${func.name} => ${result}`);
  } catch (error) {
    console.log(`${func.name} => Error: ${error}`);
  }
}

const logAllPaths = () => {
  Object.values(paths).forEach((value) => {
    if (typeof value === "function" && value !== logAllPaths) {
      logFunctionResult(value as () => string);
    }
  });
};

export default logAllPaths;
