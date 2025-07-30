const { WebSocket } = require("ws");
const {
  getChats,
  getMessagesByUserId,
  getOpenTicketByUserId,
  closeTicket,
} = require("../../src/database/tickets");
const { findUserByDbId } = require("../../src/database/users");
const { mainMenuKeyboard } = require("../../src/data/keyboards");
const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

const getMessengerPage = async (req, res) => {
  try {
    const chats = await getChats();
    res.render("messenger", { chats, currentChatUser: null, messages: [] });
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
