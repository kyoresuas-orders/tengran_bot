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
const fs = require("fs");
const path = require("path");

const localApiUrl = "http://localhost:3000";

async function notifySupportChatAboutNewMessage(
  ctx,
  ticket,
  user,
  message,
  attachment
) {
  if (!ticket.support_chat_message_id) {
    console.error(
      `Ticket ${ticket.id} has no support_chat_message_id, cannot notify chat.`
    );
    return;
  }

  const userLink = `[${user.first_name}](tg://user?id=${user.telegram_id})`;
  let notificationMessage = `💬 Новое сообщение в заявке #${ticket.id} от ${userLink}`;

  if (message) {
    notificationMessage += `\n\n*Сообщение:* ${message}`;
  }

  if (attachment) {
    notificationMessage += `\n\n*Вложение:* [${attachment.type}](${process.env.WEB_APP_URL}${attachment.url})`;
  }

  const webchatLink = `${process.env.WEB_APP_URL}/messenger/chat/${user.id}`;
  const keyboard = Markup.inlineKeyboard([
    Markup.button.url("Перейти к чату", webchatLink),
  ]);

  try {
    await ctx.telegram.sendMessage(
      process.env.SUPPORT_CHAT_ID,
      notificationMessage,
      {
        reply_to_message_id: ticket.support_chat_message_id,
        parse_mode: "Markdown",
        ...keyboard,
      }
    );
  } catch (e) {
    console.error(
      `Failed to send notification to support chat for ticket ${ticket.id}`,
      e
    );
  }
}

async function handleSupportMessage(ctx, texts) {
  const fromId = ctx.from.id;
  const messageText = ctx.message.text;
  const messagePhoto = ctx.message.photo;
  const messageVideo = ctx.message.video;

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
        await axios.post(`${localApiUrl}/api/ticket-closed-by-user`, {
          userId: userFromDb.id,
        });
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
      // Handle file messages
      if (messagePhoto || messageVideo) {
        const file = messagePhoto
          ? messagePhoto[messagePhoto.length - 1]
          : messageVideo;
        const fileLink = await ctx.telegram.getFileLink(file.file_id);
        const response = await axios({
          url: fileLink.href,
          responseType: "arraybuffer",
        });
        const fileBuffer = Buffer.from(response.data, "binary");
        const fileExtension = path.extname(fileLink.pathname);
        const fileName = `${file.file_unique_id}${fileExtension}`;
        const filePath = path.join(
          process.cwd(),
          "web",
          "public",
          "uploads",
          fileName
        );
        fs.writeFileSync(filePath, fileBuffer);

        const attachmentUrl = `/uploads/${fileName}`;
        const attachmentType = messagePhoto ? "photo" : "video";
        const caption = ctx.message.caption || null;

        await saveMessage(
          openTicketForUser.id,
          fromId,
          "user",
          caption,
          attachmentUrl,
          attachmentType
        );

        await notifySupportChatAboutNewMessage(
          ctx,
          openTicketForUser,
          userFromDb,
          caption,
          { type: attachmentType, url: attachmentUrl }
        );

        try {
          await axios.post(`${localApiUrl}/api/message-from-bot`, {
            userId: userFromDb.id,
            message: caption,
            attachmentUrl,
            attachmentType,
          });
        } catch (error) {
          console.error(
            "Failed to notify web server about new message",
            error.message
          );
        }
      } else if (messageText) {
        // Handle text messages
        await saveMessage(
          openTicketForUser.id,
          fromId,
          "user",
          messageText,
          null,
          null
        );

        await notifySupportChatAboutNewMessage(
          ctx,
          openTicketForUser,
          userFromDb,
          messageText,
          null
        );

        try {
          await axios.post(`${localApiUrl}/api/message-from-bot`, {
            userId: userFromDb.id,
            message: messageText,
          });
        } catch (error) {
          console.error(
            "Failed to notify web server about new message",
            error.message
          );
        }
      }
    }
    return true; // Сообщение обработано
  }

  // 3. Логика создания нового тикета
  if (ctx.session.state === "awaiting_support_message") {
    ctx.session.state = null; // Сбрасываем состояние

    const newTicketId = await createTicket(userFromDb.id);
    const contextMessage = ctx.session.supportContextMessage;
    if (contextMessage) {
      // Save the context message from the manager/system
      await saveMessage(
        newTicketId,
        process.env.SUPPORT_CHAT_ID,
        "manager",
        contextMessage
      );
      // Clear it from session
      ctx.session.supportContextMessage = null;
    }

    let attachmentUrl = null;
    let attachmentType = null;
    let messageToSave = messageText;

    if (messagePhoto || messageVideo) {
      const file = messagePhoto
        ? messagePhoto[messagePhoto.length - 1]
        : messageVideo;
      const fileLink = await ctx.telegram.getFileLink(file.file_id);
      const response = await axios({
        url: fileLink.href,
        responseType: "arraybuffer",
      });
      const fileBuffer = Buffer.from(response.data, "binary");
      const fileExtension = path.extname(fileLink.pathname);
      const fileName = `${file.file_unique_id}${fileExtension}`;
      const filePath = path.join(
        process.cwd(),
        "web",
        "public",
        "uploads",
        fileName
      );

      fs.writeFileSync(filePath, fileBuffer);

      attachmentUrl = `/uploads/${fileName}`;
      attachmentType = messagePhoto ? "photo" : "video";
      messageToSave = ctx.message.caption || null;
    }

    await saveMessage(
      newTicketId,
      fromId,
      "user",
      messageToSave,
      attachmentUrl,
      attachmentType
    );

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

    let initialMessage = `❗️Новая заявка #${newTicketId} от пользователя ${userLink}.`;
    if (messageToSave) {
      initialMessage += `\n\n*Сообщение:* ${messageToSave}`;
    }
    if (attachmentUrl) {
      initialMessage += `\n\n*Вложение:* [${attachmentType}](${process.env.WEB_APP_URL}${attachmentUrl})`;
    }

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
