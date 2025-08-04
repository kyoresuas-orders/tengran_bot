const { isAdmin, getUsersCount } = require("../database/users");
const { getTicketsCountByStatus } = require("../database/tickets");

module.exports = {
  name: "admin",
  execute: async (ctx) => {
    const telegramId = ctx.from.id;

    if (await isAdmin(telegramId)) {
      try {
        const totalUsers = await getUsersCount();
        const pendingTickets = await getTicketsCountByStatus("pending");
        const inProgressTickets = await getTicketsCountByStatus("in_progress");
        const closedTickets = await getTicketsCountByStatus("closed");

        const adminMenu = `
        <b>Меню администратора</b>\n\n<b>Пользователи:</b>\n- Всего: ${totalUsers}\n\n<b>Тикеты:</b>\n- В ожидании: ${pendingTickets}\n- В обработке: ${inProgressTickets}\n- Закрытые: ${closedTickets}
        `;

        await ctx.reply(adminMenu, {
          parse_mode: "HTML",
        });
      } catch (error) {
        console.error("Ошибка при получении статистики:", error);
        await ctx.reply("Произошла ошибка при получении статистики.");
      }
    } else {
      await ctx.reply("У вас нет прав для выполнения этой команды.");
    }
  },
};
