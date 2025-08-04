const { isAdmin, getUsersCount } = require("../database/users");
const { getTicketsCountByStatus } = require("../database/tickets");

module.exports = {
  name: "admin",
  description: "Показывает статистику для администратора.",
  async execute(message, bot) {
    const telegramId = message.from.id;

    if (await isAdmin(telegramId)) {
      try {
        const totalUsers = await getUsersCount();
        const pendingTickets = await getTicketsCountByStatus("pending");
        const inProgressTickets = await getTicketsCountByStatus("in_progress");
        const closedTickets = await getTicketsCountByStatus("closed");

        const adminMenu = `
        <b>Меню администратора</b>
        
        <b>Пользователи:</b>
        - Всего: ${totalUsers}

        <b>Тикеты:</b>
        - В ожидании: ${pendingTickets}
        - В обработке: ${inProgressTickets}
        - Закрытые: ${closedTickets}
        `;

        await bot.reply(message.chat.id, adminMenu, {
          parse_mode: "HTML",
        });
      } catch (error) {
        console.error("Ошибка при получении статистики:", error);
        await bot.reply(
          message.chat.id,
          "Произошла ошибка при получении статистики."
        );
      }
    } else {
      await bot.reply(
        message.chat.id,
        "У вас нет прав для выполнения этой команды."
      );
    }
  },
};
