const { findUserById, isAdmin } = require("../database/users");
const {
  mainMenuKeyboard,
  agreementKeyboard,
  supportKeyboard,
} = require("../data/keyboards");
const {
  getOpenTicketByManagerId,
  assignTicketToManager,
  getTicketById,
} = require("../database/tickets");

module.exports = {
  name: "start",
  execute: async (ctx, texts) => {
    try {
      // Логика принятия тикета для менеджера
      const payload =
        ctx.startPayload || (ctx.message && ctx.message.text.split(" ")[1]);

      if (payload) {
        const match = payload.match(/accept_ticket_(\d+)/);
        if (match) {
          const ticketId = parseInt(match[1], 10);
          const managerId = ctx.from.id;

          const isManager = await isAdmin(managerId);
          if (!isManager) {
            return ctx.reply("У вас нет прав для выполнения этого действия.");
          }

          const openTicket = await getOpenTicketByManagerId(managerId);
          if (openTicket) {
            return ctx.reply(
              `Вы уже ведете диалог по заявке #${openTicket.id}. Пожалуйста, сначала завершите его.`
            );
          }

          await assignTicketToManager(ticketId, managerId);
          await ctx.reply(
            `Вы приняли заявку #${ticketId} в работу. Все последующие сообщения будут направлены пользователю.`,
            supportKeyboard
          );

          // Отправляем уведомление пользователю
          const ticket = await getTicketById(ticketId);
          if (ticket) {
            await ctx.telegram.sendMessage(
              ticket.user_telegram_id,
              "Менеджер подключился к диалогу. Можете задать свой вопрос.",
              supportKeyboard
            );
          }

          return;
        }
      }

      // Стандартная логика для пользователя
      const user = await findUserById(ctx.from.id);

      if (user) {
        await ctx.reply(texts.commands.start.authorized, mainMenuKeyboard);
      } else {
        await ctx.reply(texts.commands.start.unauthorized, {
          ...agreementKeyboard,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      }
    } catch (err) {
      console.error("Ошибка в команде /start:", err);
      await ctx.reply("Произошла ошибка, попробуйте позже.");
    }
  },
};
