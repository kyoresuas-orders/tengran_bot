const { handleSupportMessage } = require("./chatHandler");

function registerHandlers(bot, texts) {
  bot.on("text", async (ctx) => {
    // Пропускаем обработку, если это команда /start
    if (ctx.message.text.startsWith("/start")) {
      return;
    }

    // Пытаемся обработать сообщение как часть системы поддержки
    const isSupportMessage = await handleSupportMessage(ctx, texts);

    // Если сообщение не было обработано системой поддержки,
    // отвечаем, что команда неизвестна.
    if (!isSupportMessage) {
      ctx.replyWithHTML(texts.errors.unknown_command);
    }
  });
}

module.exports = registerHandlers;
