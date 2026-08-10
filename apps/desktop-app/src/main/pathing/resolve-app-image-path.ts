import path from "node:path";

const IMAGE_ROOTS = new Set(["diddl-images", "user-images"]);

export const resolveAppImagePath = (requestUrl: string, basePath: string) => {
  const rawPathSegments = requestUrl.slice("app://".length).split(/[\\/]/);

  if (rawPathSegments.includes("..")) return null;

  let url: URL;

  try {
    url = new URL(requestUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "app:" || !IMAGE_ROOTS.has(url.hostname)) return null;

  const imageRoot = path.resolve(basePath, url.hostname);
  const requestedPath = url.pathname
    .replaceAll("\\", path.sep)
    .replaceAll("/", path.sep)
    .replace(/^[\\/]+/, "");
  const filePath = path.resolve(imageRoot, requestedPath);
  const relativePath = path.relative(imageRoot, filePath);

  if (
    relativePath === "" ||
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    return null;
  }

  // The archive contains the original .JPG name, while legacy seed data added another .jpg.
  return filePath.replaceAll(".JPG.jpg", ".JPG");
};
