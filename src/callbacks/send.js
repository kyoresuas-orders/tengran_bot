const { getAllUsers } = require("../database/users");
const { activeBroadcasts } = require("../commands/send");

async function broadcastMessage(ctx, message) {
  const users = await getAllUsers();
  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      if (message.photo) {
        const photo = message.photo[message.photo.length - 1];
        await ctx.telegram.sendPhoto(user.telegram_id, photo.file_id, {
          caption: message.caption,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } else {
        await ctx.telegram.sendMessage(user.telegram_id, message.text, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      }
      successCount++;
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(
        `Ошибка при отправке пользователю ${user.telegram_id}:`,
        error
      );
      errorCount++;
    }
  }
  return { successCount, errorCount };
}

module.exports = {
  name: "send",
  execute: async (ctx) => {
    const userId = ctx.from.id;
    const data = ctx.callbackQuery.data.split(":")[1];
    const broadcast = activeBroadcasts.get(userId);

    if (!broadcast) {
      return ctx.answerCbQuery("Рассылка не найдена или уже завершена.");
    }

    await ctx.deleteMessage();

    if (data === "cancel") {
      activeBroadcasts.delete(userId);
      return ctx.reply("Рассылка отменена.");
    }

    if (data === "confirm" && broadcast.step === "confirm") {
      activeBroadcasts.delete(userId);
      await ctx.reply("Начинаю рассылку...");

      const { successCount, errorCount } = await broadcastMessage(
        ctx,
        broadcast.message
      );

      await ctx.reply(
        `Рассылка завершена.\n\nУспешно отправлено: ${successCount}\nОшибок: ${errorCount}`
      );
    }
    await ctx.answerCbQuery();
  },
};
