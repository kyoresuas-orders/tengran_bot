const { handleSupportMessage } = require("./chatHandler");
const { sendCommand, activeBroadcasts } = require("../commands/send");

function registerHandlers(bot, texts) {
  bot.on("message", async (ctx, next) => {
    try {
      if (ctx.message.reply_to_message && activeBroadcasts.has(ctx.from.id)) {
        return sendCommand.handleReply(ctx);
      }

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
