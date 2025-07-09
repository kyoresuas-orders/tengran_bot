const { createUser } = require("../database/users");
const { mainMenuKeyboard } = require("../data/keyboards");

module.exports = {
  name: "register",
  execute: async (ctx, texts) => {
    const data = ctx.callbackQuery.data.split(":")[1];

    if (data === "agree") {
      try {
        await createUser(ctx.from);

        await ctx.answerCbQuery(texts.callbacks.register.success);

        await ctx.editMessageText(
          texts.callbacks.register.welcome,
          mainMenuKeyboard
        );
      } catch (err) {
        console.error("Не удалось зарегистрировать пользователя:", err);

        await ctx.answerCbQuery(texts.errors.database_error);
      }
    }
  },
};
