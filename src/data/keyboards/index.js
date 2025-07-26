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
  [Markup.button.callback("Связаться с поддержкой", "support:start")],
]);

const houseMenuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("О концепции", "menu:house_concept")],
  [Markup.button.callback("Адрес и график работы", "menu:house_address")],
  [Markup.button.callback("Актуальная выставка", "menu:house_exhibition")],
  [Markup.button.callback("<- Назад", "menu:back")],
]);

const sizesMenuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("Определить размер кольца", "sizes:determine")],
  [Markup.button.callback("История моих размеров", "sizes:history")],
  [Markup.button.callback("<- Назад", "menu:back")],
]);

const serviceMenuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("Программа лояльности", "service:loyalty_program")],
  [Markup.button.callback("Обновить покрытие", "service:update_coating")],
  [Markup.button.callback("Передать на ремонт", "service:repair")],
  [Markup.button.callback("Правила возврата", "service:return_policy")],
  [
    Markup.button.callback(
      "Как ухаживать за украшением?",
      "service:jewelry_care"
    ),
  ],
  [Markup.button.callback("<- Назад", "menu:back")],
]);

const backKeyboard = Markup.inlineKeyboard([
  Markup.button.callback("<- Назад", "menu:back"),
]);

const serviceBackKeyboard = Markup.inlineKeyboard([
  Markup.button.callback("<- Назад", "menu:service"),
]);

const supportBackKeyboard = Markup.inlineKeyboard([
  Markup.button.callback("<- Назад", "menu:back"),
]);

const loyaltyMenuKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback(
      "Знакомство с брендом",
      "service:loyalty:acquaintance"
    ),
  ],
  [Markup.button.callback("Друг бренда", "service:loyalty:friend")],
  [Markup.button.callback("Рассчитать сумму выкупа", "service:buyout")],
  [Markup.button.callback("<- Назад", "menu:service")],
]);

const jewelryMenuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("Все коллекции", "jewelry:all")],
  [Markup.button.callback("Бестселлеры", "jewelry:bestsellers")],
  [Markup.button.callback("Рассмотреть сеты", "jewelry:sets")],
  [Markup.button.callback("<- Назад", "menu:main")],
]);

const collectionsMenuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("Legacy", "jewelry:collection:legacy")],
  [Markup.button.callback("Lilly", "jewelry:collection:lilly")],
  [Markup.button.callback("Signals", "jewelry:collection:signals")],
  [Markup.button.callback("Серия “Ключи”", "jewelry:collection:keys")],
  [Markup.button.callback("<- Назад", "menu:jewelry")],
]);

const supportKeyboard = Markup.keyboard([
  [Markup.button.text("Завершить диалог")],
]).resize();

function createCollectionKeyboard(buttonText, url) {
  return Markup.inlineKeyboard([
    [Markup.button.url(buttonText, url)],
    [Markup.button.callback("<- Назад", "jewelry:all")],
  ]);
}

const managerKeyboard = Markup.inlineKeyboard([
  [Markup.button.url("Связаться с менеджером", "https://t.me/info10gran")],
  [Markup.button.callback("<- Назад", "menu:service")],
]);

const managerReturnKeyboard = Markup.inlineKeyboard([
  [Markup.button.url("Оформить возврат", "https://t.me/info10gran")],
  [Markup.button.callback("<- Назад", "menu:service")],
]);

function createAcceptTicketKeyboard(url) {
  return Markup.inlineKeyboard([Markup.button.url("▶️ Принять заявку", url)]);
}

module.exports = {
  agreementKeyboard,
  mainMenuKeyboard,
  houseMenuKeyboard,
  sizesMenuKeyboard,
  serviceMenuKeyboard,
  backKeyboard,
  serviceBackKeyboard,
  managerKeyboard,
  managerReturnKeyboard,
  loyaltyMenuKeyboard,
  jewelryMenuKeyboard,
  collectionsMenuKeyboard,
  createCollectionKeyboard,
  supportKeyboard,
  supportBackKeyboard,
  createAcceptTicketKeyboard,
};
