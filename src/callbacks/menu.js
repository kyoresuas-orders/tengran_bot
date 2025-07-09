module.exports = {
  name: "menu",
  execute: async (ctx, texts) => {
    const data = ctx.callbackQuery.data.split(":")[1];
    let replyText = "Этот раздел в разработке.";

    switch (data) {
      case "about":
        replyText = "Вы выбрали: О бренде";
        break;
      case "house":
        replyText = "Вы выбрали: Дом 10.GRAN";
        break;
      case "jewelry":
        replyText = "Вы выбрали: Украшения";
        break;
      case "sizes":
        replyText = "Вы выбрали: Размеры";
        break;
      case "service":
        replyText = "Вы выбрали: Сервис";
        break;
      case "status":
        replyText = "Вы выбрали: Узнать статус заказа";
        break;
      case "support":
        replyText = "Переводим на менеджера...";
        break;
    }

    await ctx.answerCbQuery(replyText, { show_alert: data === "support" });
  },
};
