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

const houseMenuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("О концепции", "menu:house_concept")],
  [Markup.button.callback("Адрес и график работы", "menu:house_address")],
  [Markup.button.callback("Актуальная выставка", "menu:house_exhibition")],
  [Markup.button.callback("⬅️ Назад", "menu:back")],
]);

const backKeyboard = Markup.inlineKeyboard([
  Markup.button.callback("⬅️ Назад", "menu:back"),
]);

module.exports = {
  agreementKeyboard,
  mainMenuKeyboard,
  houseMenuKeyboard,
  backKeyboard,
};
