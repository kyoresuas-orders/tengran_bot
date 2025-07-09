const fs = require("fs");
const path = require("path");

const registerCallbacks = (bot) => {
  const callbacks = new Map();
  const dir = path.join(__dirname, "../callbacks");

  const callbackFiles = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".js"));

  for (const file of callbackFiles) {
    const callback = require(path.join(dir, file));
    callbacks.set(callback.name, callback);
  }

  bot.on("callback_query", (ctx) => {
    const [callbackName] = ctx.callbackQuery.data.split(":");
    const callback = callbacks.get(callbackName);

    if (callback) {
      callback.execute(ctx);
    } else {
      console.error(`Колбэк обработчик для '${callbackName}' не найден.`);
      ctx.answerCbQuery("Ошибка: обработчик не найден.");
    }
  });
};

module.exports = registerCallbacks;
