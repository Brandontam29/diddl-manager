import { projectRoot, libraryMapPath, libraryPath, collectionPath } from ".";

function logFunctionResult(func: (...args: any) => string, ...args: any) {
    const result = func(...args);
    console.log(`${func.name} => ${result}`);
    return result;
}

export const logAllPaths = () => {
    const pathFunctions = [
        projectRoot,
        projectRoot,
        libraryMapPath,
        libraryPath,
        collectionPath,
    ];

    pathFunctions.forEach((func) => logFunctionResult(func));
};
