const { getAllUsers, isAdmin } = require("../database/users");
const { activeBroadcasts } = require("../state/broadcastState");

const sendCallback = {
  name: "send",
  execute: async (ctx) => {
    const userId = ctx.from.id;
    const data = ctx.callbackQuery.data;

    if (!(await isAdmin(userId))) {
      return ctx.answerCbQuery("У вас нет прав.", { show_alert: true });
    }

    const broadcast = activeBroadcasts.get(userId);
    if (!broadcast) {
      return ctx.answerCbQuery("Не удалось найти активную рассылку.", {
        show_alert: true,
      });
    }

    if (data === "send:confirm") {
      activeBroadcasts.delete(userId);
      await ctx.editMessageText("Начинаю рассылку...");

      const users = await getAllUsers();
      let sentCount = 0;
      let failedCount = 0;

      for (const user of users) {
        try {
          if (broadcast.message.photo) {
            await ctx.telegram.sendPhoto(
              user.telegram_id,
              broadcast.message.photo[broadcast.message.photo.length - 1]
                .file_id,
              {
                caption: broadcast.message.caption,
                parse_mode: "HTML",
              }
            );
          } else {
            await ctx.telegram.sendMessage(
              user.telegram_id,
              broadcast.message.text,
              {
                parse_mode: "HTML",
                disable_web_page_preview: true,
              }
            );
          }
          sentCount++;
        } catch (error) {
          console.error(
            `Failed to send message to ${user.telegram_id}:`,
            error
          );
          failedCount++;
        }
        // Добавим небольшую задержку, чтобы не превышать лимиты Telegram
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await ctx.reply(
        `✅ Рассылка завершена!\n\n- Успешно отправлено: ${sentCount}\n- Не удалось отправить: ${failedCount}`
      );
    } else if (data === "send:cancel") {
      activeBroadcasts.delete(userId);
      await ctx.editMessageText("Рассылка отменена.");
    }
  },
};

module.exports = sendCallback;
