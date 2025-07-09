const { findUserById } = require("../database/users");
const { mainMenuKeyboard, agreementKeyboard } = require("../data/keyboards");

module.exports = {
  name: "start",
  execute: async (ctx, texts) => {
    try {
      const user = await findUserById(ctx.from.id);

      if (user) {
        // Пользователь существует, показываем главное меню
        await ctx.reply(texts.commands.start.authorized, mainMenuKeyboard);
      } else {
        // Пользователя нет, показываем кнопку согласия
        await ctx.reply(texts.commands.start.unauthorized, {
          ...agreementKeyboard,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      }
    } catch (err) {
      console.error("Ошибка в команде /start:", err);
      await ctx.reply("Произошла ошибка, попробуйте позже.");
    }
  },
};
