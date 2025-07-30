const { handleSupportMessage } = require("./chatHandler");

function registerHandlers(bot, texts) {
  bot.on("message", async (ctx, next) => {
    try {
      const isSupportMessage = await handleSupportMessage(ctx, texts);

      if (!isSupportMessage) {
        return next();
      }
    } catch (error) {
      console.error("Error in message handler:", error);
      await ctx.reply(
        "Произошла непредвиденная ошибка. Пожалуйста, попробуйте еще раз."
      );
    }
  });
}

module.exports = registerHandlers;
