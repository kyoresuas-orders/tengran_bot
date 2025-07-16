const { createUser } = require("../database/users");
const { mainMenuKeyboard } = require("../data/keyboards");
const { renderView } = require("../utils/render");

module.exports = {
  name: "register",
  execute: async (ctx, texts) => {
    const data = ctx.callbackQuery.data.split(":")[1];

    if (data === "agree") {
      try {
        await createUser(ctx.from);
        await ctx.answerCbQuery(texts.callbacks.register.success);

        const view = {
          text: texts.callbacks.register.welcome,
          keyboard: mainMenuKeyboard,
        };
        await renderView(ctx, view);
      } catch (err) {
        console.error("Не удалось зарегистрировать пользователя:", err);
        await ctx.answerCbQuery(texts.errors.database_error);
      }
    }
  },
};
