const { WebSocket } = require("ws");
const { Buffer } = require("buffer");
const {
  getChats,
  getMessagesByUserId,
  getOpenTicketByUserId,
  closeTicket,
  getMessagesByTicketId,
} = require("../../src/database/tickets");
const { findUserByDbId } = require("../../src/database/users");
const { mainMenuKeyboard } = require("../../src/data/keyboards");
const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

const getMessengerPage = async (req, res) => {
  try {
    const chats = await getChats();
    res.render("messenger", {
      chats,
      currentChatUser: null,
      messages: [],
      selectedUserId: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const getChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await getChats();
    const messages = await getMessagesByUserId(userId);
    const currentChatUser = await findUserByDbId(userId);
    const currentTicket = await getOpenTicketByUserId(userId);

    res.render("messenger", {
      chats,
      messages,
      currentChatUser,
      selectedUserId: userId,
      ticketIsOpen: !!currentTicket,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const closeChatTicket = async (req, res) => {
  try {
    const { userId } = req.params;
    const ticket = await getOpenTicketByUserId(userId);

    if (ticket) {
      await closeTicket(ticket.id);
      const user = await findUserByDbId(userId);

      if (user) {
        await bot.telegram.sendMessage(
          user.telegram_id,
          "Менеджер завершил диалог. Если у вас остались вопросы, вы можете создать новую заявку.",
          Markup.removeKeyboard()
        );
        await bot.telegram.sendMessage(
          user.telegram_id,
          "Главное меню",
          mainMenuKeyboard
        );
      }

      // Notify all manager clients
      req.app.locals.managerWebsockets.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "ticketClosed",
              payload: { userId },
            })
          );
        }
      });

      // Update message in support chat
      if (ticket.support_chat_message_id) {
        const messages = await getMessagesByTicketId(ticket.id);
        let fileContent = `История переписки по заявке #${ticket.id}\n\n`;
        if (messages.length > 0) {
          messages.forEach((msg) => {
            const date = new Date(msg.created_at).toLocaleString("ru-RU");
            fileContent += `[${date}] ${msg.sender_type} (${msg.sender_id}):\n${
              msg.message || ""
            }\n\n`;
          });
        } else {
          fileContent += "Сообщений в этой переписке не было.";
        }
        const buffer = Buffer.from(fileContent, "utf-8");
        const userLink = `[${user.first_name || user.username}](tg://user?id=${
          user.telegram_id
        })`;
        const caption = `✅ **Завершен**\n\nЗаявка #${ticket.id} от пользователя ${userLink} была закрыта менеджером.`;

        try {
          await bot.telegram.deleteMessage(
            process.env.SUPPORT_CHAT_ID,
            ticket.support_chat_message_id
          );

          await bot.telegram.sendDocument(
            process.env.SUPPORT_CHAT_ID,
            {
              source: buffer,
              filename: `ticket_${ticket.id}_history.txt`,
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
    }
    res.redirect("/messenger");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getMessengerPage,
  getChat,
  closeChatTicket,
};
