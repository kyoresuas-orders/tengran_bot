const fs = require("fs");
const path = require("path");

function loadTexts() {
  const textsPath = path.join(__dirname, "..", "data", "texts.json");
  return JSON.parse(fs.readFileSync(textsPath, "utf-8"));
}

module.exports = loadTexts;
