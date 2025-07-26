const { mainMenuKeyboard } = require("../data/keyboards");
const { Markup } = require("telegraf");

function registerHandlers(bot, texts) {
  // Обработка текстовых сообщений, которые не являются командами
  bot.on("text", async (ctx) => {
    if (ctx.session && ctx.session.awaitingSupportMessage) {
      if (ctx.message.text === "Завершить диалог") {
        ctx.session.awaitingSupportMessage = false;
        await ctx.reply(
          "Диалог с поддержкой завершен.",
          Markup.removeKeyboard()
        );
        await ctx.reply(texts.commands.start.authorized, mainMenuKeyboard);
        return;
      }
      return ctx.reply(ctx.message.text);
    }

    ctx.replyWithHTML(texts.errors.unknown_command);
  });
}

module.exports = registerHandlers;
