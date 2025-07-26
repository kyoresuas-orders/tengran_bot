const {
  mainMenuKeyboard,
  createAcceptTicketKeyboard,
} = require("../data/keyboards");
const { Markup } = require("telegraf");
const { findUserById, isAdmin } = require("../database/users");
const {
  createTicket,
  getOpenTicketByUserId,
  saveMessage,
  closeTicket,
  getOpenTicketByManagerId,
  getTicketById,
} = require("../database/tickets");

async function handleSupportMessage(ctx, texts) {
  const fromId = ctx.from.id;
  const messageText = ctx.message.text;

  // 1. Логика для менеджера
  const isManager = await isAdmin(fromId);
  if (isManager) {
    const openTicketForManager = await getOpenTicketByManagerId(fromId);
    if (openTicketForManager) {
      const ticketInfo = await getTicketById(openTicketForManager.id);

      if (messageText === "Завершить диалог") {
        await closeTicket(openTicketForManager.id);
        if (ticketInfo) {
          await ctx.telegram.sendMessage(
            ticketInfo.user_telegram_id,
            "Менеджер завершил диалог. Если у вас остались вопросы, вы можете создать новую заявку.",
            Markup.removeKeyboard()
          );
          await ctx.telegram.sendMessage(
            ticketInfo.user_telegram_id,
            texts.commands.start.authorized,
            mainMenuKeyboard
          );
        }
        await ctx.reply("Диалог завершен.", Markup.removeKeyboard());
        return true;
      }

      if (ticketInfo) {
        await saveMessage(ticketInfo.id, fromId, "manager", messageText);
        await ctx.telegram.sendMessage(
          ticketInfo.user_telegram_id,
          messageText
        );
      }
      return true; // Сообщение обработано
    }
  }

  // 2. Логика для пользователя
  const userFromDb = await findUserById(fromId);
  if (!userFromDb) {
    if (ctx.session.state === "awaiting_support_message") {
      await ctx.reply(
        "Произошла ошибка. Пожалуйста, перезапустите бота командой /start."
      );
      return true;
    }
    return false;
  }

  // Проверяем, есть ли уже открытый тикет
  const openTicketForUser = await getOpenTicketByUserId(userFromDb.id);
  if (openTicketForUser) {
    if (openTicketForUser.status === "pending") {
      await ctx.reply(
        "Пожалуйста, дождитесь, пока менеджер примет вашу заявку."
      );
    } else if (openTicketForUser.status === "in_progress") {
      if (messageText === "Завершить диалог") {
        await closeTicket(openTicketForUser.id);
        // Уведомляем менеджера и убираем у него клавиатуру
        await ctx.telegram.sendMessage(
          openTicketForUser.manager_id,
          `Пользователь ${ctx.from.first_name} завершил диалог.`,
          Markup.removeKeyboard()
        );
        // Возвращаем пользователю главное меню
        await ctx.reply(
          "Диалог с поддержкой завершен.",
          Markup.removeKeyboard()
        );
        await ctx.reply(texts.commands.start.authorized, mainMenuKeyboard);
      } else {
        await saveMessage(openTicketForUser.id, fromId, "user", messageText);
        await ctx.telegram.sendMessage(
          openTicketForUser.manager_id,
          messageText
        );
      }
    }
    return true; // Сообщение обработано
  }

  // 3. Логика создания нового тикета
  if (ctx.session.state === "awaiting_support_message") {
    ctx.session.state = null; // Сбрасываем состояние

    const newTicketId = await createTicket(userFromDb.id);
    await saveMessage(newTicketId, fromId, "user", messageText);

    if (ctx.session.supportMessageId) {
      try {
        await ctx.telegram.editMessageReplyMarkup(
          ctx.chat.id,
          ctx.session.supportMessageId
        );
        ctx.session.supportMessageId = null;
      } catch (e) {
        console.error("Не удалось убрать инлайн-клавиатуру:", e);
      }
    }

    const botInfo = await ctx.telegram.getMe();
    const acceptLink = `https://t.me/${botInfo.username}?start=accept_ticket_${newTicketId}`;
    const userLink = `[${ctx.from.first_name}](tg://user?id=${fromId})`;
    const initialMessage = `❗️Новая заявка #${newTicketId} от пользователя ${userLink}.\n\n*Сообщение:* ${messageText}`;
    const keyboard = createAcceptTicketKeyboard(acceptLink);

    await ctx.telegram.sendMessage(
      process.env.SUPPORT_CHAT_ID,
      initialMessage,
      { ...keyboard, parse_mode: "Markdown" }
    );

    await ctx.reply(
      "Спасибо! Ваша заявка принята. Менеджер скоро подключится к диалогу."
    );
    return true; // Сообщение обработано
  }

  return false; // Сообщение не относится к системе поддержки
}

module.exports = { handleSupportMessage };
