const fs = require("fs");
const path = require("path");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function getImagePaths(subfolder) {
  const dir = path.join(__dirname, "../data/images", subfolder);
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const ext = path.extname(file).toLowerCase();
      const isSupportedType =
        ext === ".jpg" || ext === ".png" || ext === ".jpeg" || ext === ".webp";
      return isSupportedType && stats.size <= MAX_FILE_SIZE;
    })
    .map((file) => path.join(dir, file));
}

function getCollectionImagePaths(collectionName) {
  return getImagePaths(path.join("collection", collectionName.toLowerCase()));
}

module.exports = { getCollectionImagePaths, getImagePaths };
