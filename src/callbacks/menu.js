const {
  backKeyboard,
  mainMenuKeyboard,
  houseMenuKeyboard,
} = require("../data/keyboards");

const views = {
  main: (texts) => ({
    text: texts.commands.start.authorized,
    keyboard: mainMenuKeyboard,
  }),
  house: (texts) => ({
    text: texts.callbacks.house_submenu.intro,
    keyboard: houseMenuKeyboard,
  }),
  house_concept: (texts) => ({
    text: texts.callbacks.house_submenu.concept,
    keyboard: backKeyboard,
  }),
  house_address: (texts) => ({
    text: texts.callbacks.house_submenu.address,
    keyboard: backKeyboard,
  }),
  house_exhibition: (texts) => ({
    text: texts.callbacks.house_submenu.exhibition,
    keyboard: backKeyboard,
  }),
  about: (texts) => ({
    text: texts.callbacks.menu.about,
    keyboard: backKeyboard,
  }),
  jewelry: (texts) => ({
    text: texts.callbacks.menu.jewelry,
    keyboard: backKeyboard,
  }),
  sizes: (texts) => ({
    text: texts.callbacks.menu.sizes,
    keyboard: backKeyboard,
  }),
  service: (texts) => ({
    text: texts.callbacks.menu.service,
    keyboard: backKeyboard,
  }),
  status: (texts) => ({
    text: texts.callbacks.menu.status,
    keyboard: backKeyboard,
  }),
};

async function renderView(ctx, viewName, texts) {
  const view = views[viewName] ? views[viewName](texts) : null;

  if (!view) {
    console.error(`Экран меню не найден: ${viewName}`);
    return;
  }

  try {
    await ctx.editMessageText(view.text, view.keyboard);
  } catch (e) {
    if (!e.description.includes("message is not modified")) {
      console.error("Ошибка в renderView:", e);
    }
  }
}

const parentMap = {
  house: "main",
  about: "main",
  jewelry: "main",
  sizes: "main",
  service: "main",
  status: "main",
  house_concept: "house",
  house_address: "house",
  house_exhibition: "house",
};

module.exports = {
  name: "menu",
  execute: async (ctx, texts) => {
    ctx.session.history = ctx.session.history || [];

    const data = ctx.callbackQuery.data.split(":")[1];

    if (data === "back") {
      const lastView = ctx.session.history.pop() || "main";
      await renderView(ctx, lastView, texts);
    } else if (data === "support") {
      await ctx.answerCbQuery(texts.callbacks.menu.support, {
        show_alert: true,
      });
    } else {
      const currentView = parentMap[data];
      if (currentView) {
        ctx.session.history.push(currentView);
      }
      await renderView(ctx, data, texts);
    }
    await ctx.answerCbQuery();
  },
};
