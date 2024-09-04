import { createHash } from "crypto";
import fs from "fs";

export const getFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");

    const fileStream = fs.createReadStream(filePath);

    fileStream.on("error", reject);

    fileStream.on("data", (data) => {
      hash.update(data);
    });

    fileStream.on("end", () => {
      const fileHash = hash.digest("hex");
      resolve(fileHash);
    });
  });
};
