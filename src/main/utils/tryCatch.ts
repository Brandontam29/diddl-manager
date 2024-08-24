const tryCatch = (callback: () => any, errorHandler: (err: unknown) => any) => {
    try {
        return callback();
    } catch (error) {
        return errorHandler(error);
    }
};

export default tryCatch;
