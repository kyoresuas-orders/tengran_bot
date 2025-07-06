const fs = require("fs");
const path = require("path");

function registerCommands(bot, texts) {
  const commandsDir = path.join(__dirname, "../commands");
  fs.readdirSync(commandsDir)
    .filter((file) => file.endsWith(".js"))
    .forEach((file) => {
      try {
        const commandPath = path.join(commandsDir, file);
        const command = require(commandPath);

        if (command.name && typeof command.execute === "function") {
          bot.command(command.name, (ctx) => command.execute(ctx, texts, bot));
          console.log(`Команда /${command.name} успешно зарегистрирована.`);
        } else {
          console.warn(`Файл ${file} не является корректным модулем команды.`);
        }
      } catch (error) {
        console.error(
          `Ошибка при регистрации команды из файла ${file}:`,
          error
        );
      }
    });
}

module.exports = registerCommands;
