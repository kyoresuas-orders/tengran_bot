const { findUserById } = require("../database/users");
const { mainMenuKeyboard, agreementKeyboard } = require("../data/keyboards");

module.exports = {
  name: "start",
  execute: async (ctx, texts) => {
    try {
      // Стандартная логика для пользователя
      const user = await findUserById(ctx.from.id);

      if (user) {
        await ctx.reply(texts.commands.start.authorized, mainMenuKeyboard);
      } else {
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
