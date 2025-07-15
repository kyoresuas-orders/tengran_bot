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
  [Markup.button.url("Связаться с поддержкой", "https://t.me/info10gran_bot")],
]);

const houseMenuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("О концепции", "menu:house_concept")],
  [Markup.button.callback("Адрес и график работы", "menu:house_address")],
  [Markup.button.callback("Актуальная выставка", "menu:house_exhibition")],
  [Markup.button.callback("⬅️ Назад", "menu:back")],
]);

const sizesMenuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("Определить размер кольца", "sizes:determine")],
  [Markup.button.callback("История моих размеров", "sizes:history")],
  [Markup.button.callback("⬅️ Назад", "menu:back")],
]);

const backKeyboard = Markup.inlineKeyboard([
  Markup.button.callback("⬅️ Назад", "menu:back"),
]);

const jewelryMenuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("Наши бестселлеры", "jewelry:bestsellers")],
  [Markup.button.callback("Все украшения", "jewelry:all")],
  [Markup.button.callback("⬅️ Назад", "menu:back")],
]);

const collectionsMenuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("Legacy", "jewelry:collection:legacy")],
  [Markup.button.callback("Lilly", "jewelry:collection:lilly")],
  [Markup.button.callback("Signals", "jewelry:collection:signals")],
  [Markup.button.callback("Серия “Ключи”", "jewelry:collection:keys")],
  [Markup.button.callback("⬅️ Назад", "menu:jewelry")],
]);

function createCollectionKeyboard(buttonText, url) {
  return Markup.inlineKeyboard([
    [Markup.button.url(buttonText, url)],
    [Markup.button.callback("⬅️ Назад", "jewelry:all")],
  ]);
}

const managerKeyboard = Markup.inlineKeyboard([
  [Markup.button.url("Перейти в чат", "https://t.me/info10gran_bot")],
  [Markup.button.callback("⬅️ Назад", "menu:sizes")],
]);

module.exports = {
  agreementKeyboard,
  mainMenuKeyboard,
  houseMenuKeyboard,
  sizesMenuKeyboard,
  backKeyboard,
  jewelryMenuKeyboard,
  collectionsMenuKeyboard,
  createCollectionKeyboard,
  managerKeyboard,
};
