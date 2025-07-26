const { supportBackKeyboard } = require("../data/keyboards");
const { findUserById } = require("../database/users");
const { getOpenTicketByUserId } = require("../database/tickets");

module.exports = {
  name: "support",
  async execute(ctx) {
    const userFromDb = await findUserById(ctx.from.id);
    if (!userFromDb) {
      return ctx.answerCbQuery(
        "Не удалось найти вас в базе. Пожалуйста, перезапустите бота командой /start.",
        { show_alert: true }
      );
    }

    const openTicket = await getOpenTicketByUserId(userFromDb.id);
    if (openTicket) {
      const message =
        openTicket.status === "pending"
          ? "У вас уже есть заявка в ожидании. Пожалуйста, дождитесь ответа."
          : "Вы уже ведете диалог с менеджером. Завершите его, чтобы создать новую заявку.";
      return ctx.answerCbQuery(message, { show_alert: true });
    }

    ctx.session.state = "awaiting_support_message";

    const message = await ctx.editMessageText(
      ctx.texts.support.request,
      supportBackKeyboard
    );

    ctx.session.supportMessageId = message.message_id;
  },
};
