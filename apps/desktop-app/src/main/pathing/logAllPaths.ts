import * as paths from ".";

const logFunctionResult = <T extends []>(func: (...params: T) => string, ...args: T) => {
  try {
    const result = func(...args);
    console.log(`${func.name} => ${result}`);
  } catch (error) {
    console.log(`${func.name} => Error: ${String(error)}`);
  }
};

const logAllPaths = () => {
  Object.values(paths).forEach((value) => {
    if (typeof value === "function" && value !== logAllPaths) {
      logFunctionResult(value as () => string);
    }
  });
};

export default logAllPaths;
