const { mainMenuKeyboard } = require("../data/keyboards");
const { Markup } = require("telegraf");
const { findUserById } = require("../database/users");
const axios = require("axios");
const {
  createTicket,
  getOpenTicketByUserId,
  saveMessage,
  closeTicket,
  getTicketById,
  setTicketSupportChatMessageId,
  getMessagesByTicketId,
} = require("../database/tickets");
const { Buffer } = require("buffer");

async function handleSupportMessage(ctx, texts) {
  const fromId = ctx.from.id;
  const messageText = ctx.message.text;

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
    if (messageText === "Завершить диалог") {
      await closeTicket(openTicketForUser.id);

      // Notify web clients that ticket is closed
      try {
        await axios.post(
          `${process.env.WEB_APP_URL}/api/ticket-closed-by-user`,
          {
            userId: userFromDb.id,
          }
        );
      } catch (error) {
        console.error(
          "Failed to send ticket-closed notification to web server",
          error.message
        );
      }

      // Отправляем уведомление в чат поддержки (если он есть)
      if (openTicketForUser.support_chat_message_id) {
        try {
          await updateClosedTicketMessage(
            ctx,
            openTicketForUser,
            "пользователем"
          );
        } catch (e) {
          console.error(
            "Failed to update support chat message on user close.",
            e
          );
        }
      }

      // Отправляем уведомление менеджеру, если он был назначен
      if (openTicketForUser.manager_id) {
        await ctx.telegram.sendMessage(
          openTicketForUser.manager_id,
          `Пользователь ${ctx.from.first_name} завершил диалог.`,
          Markup.removeKeyboard()
        );
      }

      // Возвращаем пользователю главное меню и убираем клавиатуру
      await ctx.reply("Диалог с поддержкой завершен.", Markup.removeKeyboard());
      await ctx.reply(texts.commands.start.authorized, mainMenuKeyboard);

      // Для всех остальных сообщений в открытом или ожидающем тикете
    } else if (
      openTicketForUser.status === "pending" ||
      openTicketForUser.status === "in_progress"
    ) {
      await saveMessage(openTicketForUser.id, fromId, "user", messageText);
      // Отправляем сообщение на веб-сервер
      try {
        await axios.post(`${process.env.WEB_APP_URL}/api/message-from-bot`, {
          userId: userFromDb.id,
          message: messageText,
        });
      } catch (error) {
        console.error("Failed to send message to web server", error.message);
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

    // Новое уведомление со ссылкой на сайт
    const userLink = `[${ctx.from.first_name}](tg://user?id=${fromId})`;
    const webchatLink = `${process.env.WEB_APP_URL}/messenger/chat/${userFromDb.id}`;
    const initialMessage = `❗️Новая заявка #${newTicketId} от пользователя ${userLink}.\n\n*Сообщение:* ${messageText}`;

    const keyboard = Markup.inlineKeyboard([
      Markup.button.url("Перейти к чату", webchatLink),
    ]);

    const sentMessage = await ctx.telegram.sendMessage(
      process.env.SUPPORT_CHAT_ID,
      initialMessage,
      { ...keyboard, parse_mode: "Markdown" }
    );

    await setTicketSupportChatMessageId(newTicketId, sentMessage.message_id);

    await ctx.reply(
      "Спасибо! Ваша заявка принята. Менеджер скоро ответит вам в чате."
    );
    return true; // Сообщение обработано
  }

  return false; // Сообщение не относится к системе поддержки
}

async function updateClosedTicketMessage(ctx, ticketInfo, closedBy) {
  if (!ticketInfo.support_chat_message_id) return;

  const freshTicketInfo = await getTicketById(ticketInfo.id);
  if (!freshTicketInfo) return;

  const messages = await getMessagesByTicketId(ticketInfo.id);

  let fileContent = `История переписки по заявке #${ticketInfo.id}\n\n`;
  if (messages.length > 0) {
    messages.forEach((msg) => {
      const date = new Date(msg.created_at).toLocaleString("ru-RU");
      fileContent += `[${date}] ${msg.sender_type} (${msg.sender_id}):\n${msg.message}\n\n`;
    });
  } else {
    fileContent += "Сообщений в этой переписке не было.";
  }

  const buffer = Buffer.from(fileContent, "utf-8");

  const userLink = `[${freshTicketInfo.user_first_name}](tg://user?id=${freshTicketInfo.user_telegram_id})`;
  const caption = `✅ **Завершен**\n\nЗаявка #${freshTicketInfo.id} от пользователя ${userLink} была закрыта ${closedBy}.`;

  try {
    await ctx.telegram.deleteMessage(
      process.env.SUPPORT_CHAT_ID,
      freshTicketInfo.support_chat_message_id
    );

    await ctx.telegram.sendDocument(
      process.env.SUPPORT_CHAT_ID,
      {
        source: buffer,
        filename: `ticket_${ticketInfo.id}_history.txt`,
      },
      {
        caption: caption,
        parse_mode: "Markdown",
      }
    );
  } catch (e) {
    console.error("Не удалось обновить сообщение о заявке:", e);
  }
}

module.exports = { handleSupportMessage };
