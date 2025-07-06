require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Telegraf } = require("telegraf");
const registerCommands = require("./utils/registerCommands");
const registerHandlers = require("./handlers/registerHandlers");

// Проверяем, задан ли токен
if (!process.env.BOT_TOKEN) {
  console.error("Токен бота не найден");
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Загрузка текстов
const textsPath = path.join(__dirname, "data", "texts.json");
const texts = JSON.parse(fs.readFileSync(textsPath, "utf-8"));

// Регистрация команд
registerCommands(bot, texts);

// Регистрация обработчиков
registerHandlers(bot, texts);

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
