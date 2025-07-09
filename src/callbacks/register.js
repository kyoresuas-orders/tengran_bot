const { createUser } = require("../database/users");
const { mainMenuKeyboard } = require("../keyboards");

module.exports = {
  name: "register",
  execute: async (ctx) => {
    const data = ctx.callbackQuery.data.split(":")[1];

    if (data === "agree") {
      try {
        await createUser(ctx.from);
        await ctx.answerCbQuery("Вы успешно зарегистрированы!");
        await ctx.editMessageText("Добро пожаловать!", mainMenuKeyboard);
      } catch (err) {
        console.error("Не удалось зарегистрировать пользователя:", err);
        await ctx.answerCbQuery("Произошла ошибка при регистрации.");
      }
    }
  },
};
