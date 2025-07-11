const {
  jewelryMenuKeyboard,
  collectionsMenuKeyboard,
  createCollectionKeyboard,
} = require("../data/keyboards");
const { Markup } = require("telegraf");
const { scrapeProduct } = require("../utils/scraper");

const BESTSELLER_URLS = [
  "https://10gran.com/jewelry/ru/tproduct/356705929-520549432671-room-signet",
  "https://10gran.com/jewelry/ru/tproduct/356705929-572685039482-round",
  "https://10gran.com/jewelry/ru/tproduct/356705929-253811362662-square",
  "https://10gran.com/jewelry/ru/tproduct/356705929-815568690521-ribs",
  "https://10gran.com/jewelry/ru/tproduct/356705929-325462902711-ribs-s",
  "https://10gran.com/jewelry/ru/tproduct/356705929-267367298022-klyuch",
  "https://10gran.com/jewelry/ru/tproduct/356705929-188624234642-bui-romb",
  "https://10gran.com/jewelry/ru/tproduct/356705929-372088483182-bui-shar",
  "https://10gran.com/jewelry/ru/tproduct/356705929-676067730111-ribs-hoops",
  "https://10gran.com/jewelry/ru/tproduct/356705929-439945266516-luca",
  "https://10gran.com/jewelry/ru/tproduct/356705929-804700143121-room",
];

const collectionsData = {
  legacy: {
    textKey: "collection_legacy",
    buttonText: "рассмотреть украшения",
    url: "https://10gran.com/jewelry/ru?tfc_charact:4318552%5B356705929%5D=Legacy&tfc_div=:::",
  },
  lilly: {
    textKey: "collection_lilly",
    buttonText: "рассмотреть украшения",
    url: "https://10gran.com/jewelry/ru?tfc_charact:4318552%5B356705929%5D=Lilly&tfc_div=:::",
  },
  signals: {
    textKey: "collection_signals",
    buttonText: "рассмотреть сигналы",
    url: "https://10gran.com/jewelry/ru?tfc_charact:4318552%5B356705929%5D=Signals&tfc_div=:::",
  },
  keys: {
    textKey: "collection_keys",
    buttonText: "рассмотреть ключи",
    url: "https://10gran.com/jewelry/ru?tfc_charact:4318363%5B356705929%5D=Подвески&tfc_div=:::",
  },
};

function createBestsellersKeyboard(currentIndex, productUrl) {
  const total = BESTSELLER_URLS.length;
  const pageIndicator = `${currentIndex + 1}/${total}`;

  const row1 = [];
  if (currentIndex > 0) {
    row1.push(
      Markup.button.callback(
        "⬅️",
        `jewelry:bestsellers:page:${currentIndex - 1}`
      )
    );
  }
  row1.push(Markup.button.callback(pageIndicator, "jewelry:noop"));
  if (currentIndex < total - 1) {
    row1.push(
      Markup.button.callback(
        "➡️",
        `jewelry:bestsellers:page:${currentIndex + 1}`
      )
    );
  }

  return Markup.inlineKeyboard([
    row1,
    [Markup.button.url("Заказать", productUrl)],
    [Markup.button.callback("⬅️ Назад", "jewelry:back")],
  ]);
}

async function showBestseller(ctx, page = 0, isEdit = false) {
  const url = BESTSELLER_URLS[page];
  if (!url) {
    console.error(`URL бестселлера не найден для страницы: ${page}`);
    return ctx.reply("Товар не найден.");
  }

  const product = await scrapeProduct(url);

  if (!product) {
    return ctx.reply("Не удалось загрузить информацию о товаре.");
  }

  const caption = `<b>${product.name}</b>\n${product.brand}\n\nЦена: ${product.price}`;
  const keyboard = createBestsellersKeyboard(page, url);

  if (isEdit) {
    try {
      await ctx.editMessageMedia(
        { type: "photo", media: product.imageUrl, caption, parse_mode: "HTML" },
        keyboard
      );
    } catch (err) {
      console.error("Не удалось отредактировать сообщение:", err);
      await ctx.deleteMessage();
      await ctx.replyWithPhoto(product.imageUrl, {
        caption: caption,
        parse_mode: "HTML",
        ...keyboard,
      });
    }
  } else {
    await ctx.deleteMessage();
    await ctx.replyWithPhoto(product.imageUrl, {
      caption: caption,
      parse_mode: "HTML",
      ...keyboard,
    });
  }
}

module.exports = {
  name: "jewelry",
  execute: async (ctx, texts) => {
    const dataParts = ctx.callbackQuery.data.split(":");
    const action = dataParts[1];

    switch (action) {
      case "bestsellers":
        const isEdit = ctx.callbackQuery.message.photo !== undefined;
        const page = dataParts[3] ? parseInt(dataParts[3], 10) : 0;
        await showBestseller(ctx, page, isEdit);
        break;
      case "all":
        await ctx.editMessageText(
          texts.callbacks.jewelry_submenu.all_intro,
          collectionsMenuKeyboard
        );
        break;
      case "collection":
        const collectionName = dataParts[2];
        const collection = collectionsData[collectionName];
        if (collection) {
          const text = texts.callbacks.jewelry_submenu[collection.textKey];
          const keyboard = createCollectionKeyboard(
            collection.buttonText,
            collection.url
          );
          await ctx.editMessageText(text, keyboard);
        }
        break;
      case "back":
        await ctx.deleteMessage();
        await ctx.reply(
          texts.callbacks.jewelry_submenu.intro,
          jewelryMenuKeyboard
        );
        break;
      case "noop":
        break;
    }
    await ctx.answerCbQuery();
  },
};
