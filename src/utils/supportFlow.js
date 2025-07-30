const { findUserById } = require("../database/users");
const { getOpenTicketByUserId } = require("../database/tickets");
const { supportBackKeyboard } = require("../data/keyboards");

async function initiateSupportFlow(ctx, text) {
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
  ctx.session.supportContextMessage = text;
  const message = await ctx.editMessageText(text, supportBackKeyboard);
  ctx.session.supportMessageId = message.message_id;
}

module.exports = { initiateSupportFlow };
