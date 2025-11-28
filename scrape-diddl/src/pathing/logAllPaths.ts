import {
    projectRoot,
    libaryMapPath,
    libraryItemTypeMapPath,
    structurePath,
    libraryIndexMap,
} from ".";

function logFunctionResult(func: (...args: any) => string, ...args: any) {
    const result = func(...args);
    console.log(`${func.name} => ${result}`);
    return result;
}

export const logAllPaths = () => {
    const pathFunctions = [
        projectRoot,
        libaryMapPath,
        libraryItemTypeMapPath,
        structurePath,
        libraryIndexMap,
    ];

    pathFunctions.forEach((func) => logFunctionResult(func));
};
