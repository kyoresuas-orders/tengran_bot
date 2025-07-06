function registerHandlers(bot, texts) {
  // Обработка текстовых сообщений, которые не являются командами
  bot.on("text", (ctx) => {
    ctx.replyWithHTML(texts.errors.unknown_command);
  });
}

module.exports = registerHandlers;
