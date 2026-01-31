export const toError = (error: unknown) =>
  error instanceof Error ? error : new Error(String(error));
