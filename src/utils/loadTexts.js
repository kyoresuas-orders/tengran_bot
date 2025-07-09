const textsSource = require("../data/texts.json");

const get = (obj, path) =>
  path.split(".").reduce((acc, part) => acc && acc[part], obj);

const loadTexts = () => {
  // Глубокое клонирование, чтобы не изменять кеш require
  const texts = JSON.parse(JSON.stringify(textsSource));

  const resolve = (currentObject) => {
    for (const key in currentObject) {
      const value = currentObject[key];
      if (typeof value === "string" && value.startsWith("$")) {
        const path = value.substring(1);
        const resolvedValue = get(texts, path);

        if (resolvedValue !== undefined) {
          currentObject[key] = resolvedValue;
        } else {
          console.error(`Ссылка на текст не найдена: ${value}`);
        }
      } else if (typeof value === "object" && value !== null) {
        resolve(value);
      }
    }
  };

  resolve(texts);
  return texts;
};

module.exports = loadTexts;
