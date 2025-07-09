const { findUserById } = require("../database/users");
const { mainMenuKeyboard, agreementKeyboard } = require("../keyboards");

module.exports = {
  name: "start",
  execute: async (ctx, texts) => {
    try {
      const user = await findUserById(ctx.from.id);

      if (user) {
        // Пользователь существует, показываем главное меню
        await ctx.reply("Еще раз привет! (нужен текст)", mainMenuKeyboard);
      } else {
        // Пользователя нет, показываем кнопку согласия
        await ctx.reply(
          texts.commands.start.reply,
          agreementKeyboard.extra({
            parse_mode: "HTML",
            disable_web_page_preview: true,
          })
        );
      }
    } catch (err) {
      console.error("Ошибка в команде /start:", err);
      await ctx.reply("Произошла ошибка, попробуйте позже.");
    }
  },
};
