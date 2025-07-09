const { Markup } = require("telegraf");

const agreementKeyboard = Markup.inlineKeyboard([
  Markup.button.callback("Соглашаюсь", "register:agree"),
]);

const mainMenuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("О бренде", "menu:about")],
  [Markup.button.callback("Дом 10.GRAN", "menu:house")],
  [Markup.button.callback("Украшения", "menu:jewelry")],
  [Markup.button.callback("Размеры", "menu:sizes")],
  [Markup.button.callback("Сервис", "menu:service")],
  [Markup.button.callback("Узнать статус заказа", "menu:status")],
  [Markup.button.callback("Связаться с поддержкой", "menu:support")],
]);

module.exports = {
  agreementKeyboard,
  mainMenuKeyboard,
};
