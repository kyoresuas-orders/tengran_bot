module.exports = {
  name: "menu",
  execute: async (ctx, a) => {
    const data = ctx.callbackQuery.data.split(":")[1];
    console.log("Обработка колбэка 'menu':", data);
    await ctx.answerCbQuery(`Вы нажали на кнопку меню: ${data}`);
  },
};
