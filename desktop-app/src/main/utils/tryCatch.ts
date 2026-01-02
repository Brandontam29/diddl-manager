const tryCatch = <T, U>(callback: () => T, errorHandler: (err: unknown) => U): T | U => {
  try {
    return callback();
  } catch (error) {
    return errorHandler(error);
  }
};

export default tryCatch;
