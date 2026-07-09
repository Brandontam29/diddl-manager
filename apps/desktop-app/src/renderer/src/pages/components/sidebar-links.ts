export const getParams = (
  currentPath: string,
  params: { type?: string; from?: number; to?: number },
) => {
  const url = new URL(currentPath, "http://localhost");

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      url.searchParams.delete(key);
      continue;
    }

    url.searchParams.set(key, `${value}`);
  }

  const search = url.searchParams.toString();

  return `${url.pathname}${search ? `?${search}` : ""}`;
};
