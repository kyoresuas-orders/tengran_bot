require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Telegraf } = require("telegraf");

// Проверяем, задан ли токен
if (!process.env.BOT_TOKEN) {
  console.error("Токен бота не найден");
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Загрузка текстов
const textsPath = path.join(__dirname, "data", "texts.json");
const texts = JSON.parse(fs.readFileSync(textsPath, "utf-8"));

// Динамическая регистрация команд
const commandsDir = path.join(__dirname, "commands");
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
      console.error(`Ошибка при регистрации команды из файла ${file}:`, error);
    }
  });

// Обработка текстовых сообщений, которые не являются командами
bot.on("text", (ctx) => {
  ctx.replyWithHTML(texts.errors.unknown_command);
});

// Запуск бота
bot
  .launch()
  .then(() => {
    console.log("Бот успешно запущен.");
  })
  .catch((err) => {
    console.error("Ошибка при запуске бота:", err);
  });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
