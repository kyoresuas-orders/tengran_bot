const { isAdmin } = require("../database/users");
const { getMessagesByTicketId } = require("../database/tickets");
const { Buffer } = require("buffer");

module.exports = {
  name: "export",
  description:
    "Экспорт переписки по заявке. Использование: /export <ID заявки>",
  execute: async (ctx) => {
    try {
      const managerId = ctx.from.id;
      const isManager = await isAdmin(managerId);

      if (!isManager) {
        return ctx.reply("Эта команда доступна только для менеджеров.");
      }

      const args = ctx.message.text.split(" ");
      if (args.length < 2) {
        return ctx.reply(
          "Пожалуйста, укажите ID заявки. Использование: /export <ID>"
        );
      }

      const ticketId = parseInt(args[1], 10);
      if (isNaN(ticketId)) {
        return ctx.reply("ID заявки должен быть числом.");
      }

      const messages = await getMessagesByTicketId(ticketId);

      if (messages.length === 0) {
        return ctx.reply(`Не найдено сообщений для заявки с ID ${ticketId}.`);
      }

      let fileContent = `История переписки по заявке #${ticketId}\n\n`;
      messages.forEach((msg) => {
        const date = new Date(msg.created_at).toLocaleString("ru-RU");
        fileContent += `[${date}] ${msg.sender_type} (${msg.sender_id}):\n${msg.message}\n\n`;
      });

      const buffer = Buffer.from(fileContent, "utf-8");

      await ctx.replyWithDocument({
        source: buffer,
        filename: `ticket_${ticketId}_history.txt`,
      });
    } catch (err) {
      console.error("Ошибка в команде /export:", err);
      await ctx.reply("Произошла ошибка при экспорте переписки.");
    }
  },
  handleReply: (ctx) => {},
};
