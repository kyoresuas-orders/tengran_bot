const {
  jewelryMenuKeyboard,
  collectionsMenuKeyboard,
  createCollectionKeyboard,
} = require("../data/keyboards");
const { Markup } = require("telegraf");
const { renderView } = require("../utils/render");
const { scrapeProduct } = require("../utils/scraper");
const { getCollectionImagePaths } = require("../utils/fileUtils");

function formatPrice(priceString) {
  const number = Number(priceString);
  if (isNaN(number)) {
    return priceString;
  }
  return new Intl.NumberFormat("ru-RU").format(number) + "₽";
}

const BESTSELLERS_DATA = [
  {
    url: "https://10gran.com/jewelry/ru/tproduct/356705929-520549432671-room-signet",
    coating: "Серебро 925, покрытие из родия",
  },
  {
    url: "https://10gran.com/jewelry/ru/tproduct/356705929-572685039482-round",
    coating: "Серебро 925, покрытие из золота",
  },
  {
    url: "https://10gran.com/jewelry/ru/tproduct/356705929-253811362662-square",
    coating: "Серебро 925, покрытие из родия",
  },
  {
    url: "https://10gran.com/jewelry/ru/tproduct/356705929-815568690521-ribs",
    coating: "Серебро 925, покрытие из золота",
  },
  {
    url: "https://10gran.com/jewelry/ru/tproduct/356705929-325462902711-ribs-s",
    coating: "Серебро 925, покрытие из родия",
  },
  {
    url: "https://10gran.com/jewelry/ru/tproduct/356705929-267367298022-klyuch",
    coating: "Серебро 925, покрытие из золота",
  },
  {
    url: "https://10gran.com/jewelry/ru/tproduct/356705929-188624234642-bui-romb",
    coating: "Серебро 925, покрытие из родия",
  },
  {
    url: "https://10gran.com/jewelry/ru/tproduct/356705929-372088483182-bui-shar",
    coating: "Серебро 925, покрытие из золота",
  },
  {
    url: "https://10gran.com/jewelry/ru/tproduct/356705929-676067730111-ribs-hoops",
    coating: "Серебро 925, покрытие из родия",
  },
  {
    url: "https://10gran.com/jewelry/ru/tproduct/356705929-439945266516-luca",
    coating: "Серебро 925, покрытие из родия",
  },
  {
    url: "https://10gran.com/jewelry/ru/tproduct/356705929-804700143121-room",
    coating: "Серебро 925, покрытие из родия",
  },
];

const collectionsData = {
  legacy: {
    textKey: "collection_legacy",
    buttonText: "Рассмотреть украшения",
    url: "https://10gran.com/jewelry/ru?tfc_charact:4318552%5B356705929%5D=Legacy&tfc_div=:::",
  },
  lilly: {
    textKey: "collection_lilly",
    buttonText: "Рассмотреть украшения",
    url: "https://10gran.com/jewelry/ru?tfc_charact:4318552%5B356705929%5D=Lilly&tfc_div=:::",
  },
  signals: {
    textKey: "collection_signals",
    buttonText: "Рассмотреть сигналы",
    url: "https://10gran.com/jewelry/ru?tfc_charact:4318552%5B356705929%5D=Signals&tfc_div=:::",
  },
  keys: {
    textKey: "collection_keys",
    buttonText: "Рассмотреть ключи",
    url: "https://10gran.com/jewelry/ru?tfc_charact:4318363%5B356705929%5D=Подвески&tfc_div=:::",
  },
};

function createBestsellersKeyboard(currentIndex, productUrl) {
  const total = BESTSELLERS_DATA.length;
  const pageIndicator = `${currentIndex + 1}/${total}`;

  const row1 = [];
  if (currentIndex > 0) {
    row1.push(
      Markup.button.callback(
        "<-",
        `jewelry:bestsellers:page:${currentIndex - 1}`
      )
    );
  }
  row1.push(Markup.button.callback(pageIndicator, "jewelry:noop"));
  if (currentIndex < total - 1) {
    row1.push(
      Markup.button.callback(
        "->",
        `jewelry:bestsellers:page:${currentIndex + 1}`
      )
    );
  }

  return Markup.inlineKeyboard([
    row1,
    [Markup.button.url("Заказать", productUrl)],
    [Markup.button.callback("<- Назад", "jewelry:back")],
  ]);
}

module.exports = {
  name: "jewelry",
  execute: async (ctx, texts) => {
    const dataParts = ctx.callbackQuery.data.split(":");
    const action = dataParts[1];
    let view;

    switch (action) {
      case "bestsellers":
        const page = dataParts[3] ? parseInt(dataParts[3], 10) : 0;
        const bestsellerData = BESTSELLERS_DATA[page];
        if (!bestsellerData) {
          return ctx.reply("Товар не найден.");
        }
        const product = await scrapeProduct(bestsellerData.url);
        if (!product) {
          return ctx.reply("Не удалось загрузить информацию о товаре.");
        }
        view = {
          text: `<b>${product.name}</b>\n${product.brand}\n${
            bestsellerData.coating
          }\n\nЦена: ${formatPrice(product.price)}`,
          photo: product.imageUrl,
          keyboard: createBestsellersKeyboard(page, bestsellerData.url),
          options: { parse_mode: "HTML", disable_web_page_preview: true },
        };
        break;
      case "all":
        view = {
          text: texts.callbacks.jewelry_submenu.all_intro,
          keyboard: collectionsMenuKeyboard,
        };
        break;
      case "collection":
      case "collection_page":
        const collectionName = dataParts[2];
        const collection = collectionsData[collectionName];
        if (collection) {
          const imagePaths = getCollectionImagePaths(collectionName);
          if (imagePaths.length === 0) {
            return ctx.reply("В этой коллекции пока нет изображений.");
          }

          const text = texts.callbacks.jewelry_submenu[collection.textKey];

          const keyboard = Markup.inlineKeyboard([
            [
              Markup.button.url(
                collectionsData[collectionName].buttonText,
                collectionsData[collectionName].url
              ),
            ],
            [Markup.button.callback("<- Назад", "jewelry:all")],
          ]);

          view = {
            text,
            photos: imagePaths,
            keyboard,
            options: { parse_mode: "HTML", disable_web_page_preview: true },
          };
        }
        break;
      case "sets":
        view = {
          text: texts.callbacks.jewelry_submenu.sets,
          photos: [
            "src/data/images/sets/1.png",
            "src/data/images/sets/2.png",
            "src/data/images/sets/3.png",
            "src/data/images/sets/4.png",
            "src/data/images/sets/5.png",
            "src/data/images/sets/6.png",
          ],
          keyboard: Markup.inlineKeyboard([
            [Markup.button.url("Рассмотреть сеты", "https://10gran.com/sets")],
            [Markup.button.callback("<- Назад", "jewelry:back")],
          ]),
          options: {
            disable_web_page_preview: true,
          },
        };
        break;
      case "back":
        view = {
          text: texts.callbacks.jewelry_submenu.intro,
          keyboard: jewelryMenuKeyboard,
        };
        break;
      case "noop":
        return ctx.answerCbQuery();
    }

    if (view) {
      await renderView(ctx, view);
    }

    await ctx.answerCbQuery();
  },
};
