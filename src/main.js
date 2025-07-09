require("dotenv").config();
const { Telegraf } = require("telegraf");
const loadTexts = require("./utils/loadTexts");
const LocalSession = require("telegraf-session-local");
const registerCommands = require("./utils/registerCommands");
const registerCallbacks = require("./utils/registerCallbacks");
const registerHandlers = require("./handlers/registerHandlers");

// Проверяем, задан ли токен
if (!process.env.BOT_TOKEN) {
  console.error("Токен бота не найден");
  process.exit(1);
}

// Создаем бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Подключаем сессии
const session = new LocalSession({ database: "sessions.json" });
bot.use(session.middleware());

// Загрузка текстов
const texts = loadTexts();
bot.context.texts = texts;

// Регистрация команд
registerCommands(bot, texts);

// Регистрация обработчиков
registerHandlers(bot, texts);

// Регистрация колбэков
registerCallbacks(bot);

// Запуск бота
bot
  .launch()
  .then(() => {
    console.log("Бот успешно запущен");
  })
  .catch((err) => {
    console.error("Ошибка при запуске бота:", err);
  });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
