const fs = require("fs");
const path = require("path");

function registerCommands(bot, texts) {
  const dir = path.join(__dirname, "../commands");

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".js")) continue;
    try {
      const command = require(path.join(commandsDir, file));

      if (command.name && typeof command.execute === "function") {
        bot.command(command.name, (ctx) => command.execute(ctx, texts, bot));
      } else {
        console.warn(`Некорректный модуль команды: ${file}`);
      }
    } catch (err) {
      console.error(`Ошибка регистрации команды ${file}:`, err);
    }
  }
}

module.exports = registerCommands;
