const fs = require("fs");
const path = require("path");
const sizeOf = require("image-size");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function getImagePaths(subfolder) {
  const dir = path.join(__dirname, "../data/images", subfolder);
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .map((file) => path.join(dir, file))
    .filter((filePath) => {
      try {
        const stats = fs.statSync(filePath);
        if (stats.size > MAX_FILE_SIZE) {
          return false;
        }

        const dimensions = sizeOf(filePath);
        const { width, height } = dimensions;

        if (width > 10000 || height > 10000 || width + height > 10000) {
          console.warn(
            `[fileUtils] Пропущено изображение с неверными размерами: ${filePath}`
          );
          return false;
        }
        if (width / height > 20 || height / width > 20) {
          console.warn(
            `[fileUtils] Пропущено изображение с неверным соотношением сторон: ${filePath}`
          );
          return false;
        }

        const ext = path.extname(filePath).toLowerCase();
        const isSupportedType =
          ext === ".jpg" ||
          ext === ".png" ||
          ext === ".jpeg" ||
          ext === ".webp";

        return isSupportedType;
      } catch (e) {
        console.error(`[fileUtils] Не удалось обработать файл: ${filePath}`, e);
        return false;
      }
    });
}

function getCollectionImagePaths(collectionName) {
  return getImagePaths(path.join("collection", collectionName.toLowerCase()));
}

module.exports = { getCollectionImagePaths, getImagePaths };
