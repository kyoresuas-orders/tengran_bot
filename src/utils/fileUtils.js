const fs = require("fs");
const path = require("path");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function getCollectionImagePaths(collectionName) {
  const dir = path.join(
    __dirname,
    "../data/images/collection",
    collectionName.toLowerCase()
  );
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const isSupportedType =
        file.endsWith(".jpg") ||
        file.endsWith(".png") ||
        file.endsWith(".jpeg") ||
        file.endsWith(".webp");
      return isSupportedType && stats.size <= MAX_FILE_SIZE;
    })
    .map((file) => path.join(dir, file));
}

module.exports = { getCollectionImagePaths };
