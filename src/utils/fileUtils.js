const fs = require("fs");
const path = require("path");
const sizeOf = require("image-size");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_DIMENSION = 10000;
const MAX_DIMENSION_SUM = 10000;
const MAX_ASPECT_RATIO = 20;

function getImagePaths(subfolder) {
  const dir = path.join(__dirname, "../data/images", subfolder);
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .map((file) => path.join(dir, file))
    .filter((filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      const isSupportedType =
        ext === ".jpg" || ext === ".png" || ext === ".jpeg" || ext === ".webp";

      if (!isSupportedType) {
        return false;
      }

      try {
        const stats = fs.statSync(filePath);
        if (stats.size > MAX_FILE_SIZE) {
          console.warn(
            `[fileUtils] Пропущен файл из-за размера > 10MB: ${filePath}`
          );
          return false;
        }

        // Читаем файл в буфер
        const buffer = fs.readFileSync(filePath);
        const dimensions = sizeOf(buffer);
        const { width, height } = dimensions;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          console.warn(
            `[fileUtils] Пропущено изображение с размером стороны > ${MAX_DIMENSION}px: ${filePath}`
          );
          return false;
        }
        if (width + height > MAX_DIMENSION_SUM) {
          console.warn(
            `[fileUtils] Пропущено изображение с суммой сторон > ${MAX_DIMENSION_SUM}px: ${filePath}`
          );
          return false;
        }
        if (
          width / height > MAX_ASPECT_RATIO ||
          height / width > MAX_ASPECT_RATIO
        ) {
          console.warn(
            `[fileUtils] Пропущено изображение с соотношением сторон > ${MAX_ASPECT_RATIO}: ${filePath}`
          );
          return false;
        }

        return true;
      } catch (e) {
        console.error(
          `[fileUtils] Не удалось обработать файл изображения: ${filePath}`,
          e
        );
        return false;
      }
    });
}

function getCollectionImagePaths(collectionName) {
  return getImagePaths(path.join("collection", collectionName.toLowerCase()));
}

module.exports = { getCollectionImagePaths, getImagePaths };
