const { getChats, getMessagesByUserId } = require("../../src/database/tickets");
const { findUserByDbId } = require("../../src/database/users");

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

    res.render("messenger", { chats, messages, currentChatUser });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getMessengerPage,
  getChat,
};
