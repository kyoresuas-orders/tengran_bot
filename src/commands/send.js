const { isAdmin } = require("../database/users");
const { Markup } = require("telegraf");

const activeBroadcasts = new Map();

const sendCommand = {
  name: "send",
  description: "Разослать сообщение всем пользователям",
  execute: async (ctx) => {
    const userId = ctx.from.id;

    if (!(await isAdmin(userId))) {
      return ctx.reply("У вас нет прав для выполнения этой команды.");
    }

    if (activeBroadcasts.has(userId)) {
      return ctx.reply(
        "Вы уже начали процесс рассылки. Завершите или отмените его."
      );
    }

    activeBroadcasts.set(userId, { step: "prompt" });

    await ctx.reply(
      "Пожалуйста, введите сообщение для рассылки. Вы можете использовать HTML-теги для форматирования, а также отправлять фото с подписью.",
      Markup.forceReply()
    );
  },
  handleReply: async (ctx) => {
    const userId = ctx.from.id;
    const broadcast = activeBroadcasts.get(userId);

    if (!broadcast || broadcast.step !== "prompt") {
      return;
    }

    if (ctx.message.text === "/cancel") {
      activeBroadcasts.delete(userId);
      return ctx.reply("Рассылка отменена.");
    }

    broadcast.message = ctx.message;
    broadcast.step = "confirm";

    const confirmationKeyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback("✅ Отправить", "send:confirm"),
        Markup.button.callback("❌ Отменить", "send:cancel"),
      ],
    ]);

    await ctx.reply("Вы уверены, что хотите отправить это сообщение?", {
      ...confirmationKeyboard,
      reply_to_message_id: ctx.message.message_id,
    });
  },
};

module.exports = {
  sendCommand,
  activeBroadcasts,
};
