const { backKeyboard } = require("../data/keyboards");

const views = {
  determine: (texts) => ({
    text: texts.callbacks.sizes_submenu.determine_text,
    keyboard: backKeyboard,
  }),
  history: (texts) => ({
    text: texts.callbacks.sizes_submenu.history_text,
    keyboard: backKeyboard,
  }),
};

async function renderView(ctx, viewName, texts) {
  const view = views[viewName] ? views[viewName](texts) : null;

  if (!view) {
    console.error(`Экран размеров не найден: ${viewName}`);
    return;
  }

  try {
    await ctx.editMessageText(view.text, view.keyboard);
  } catch (e) {
    if (!e.description.includes("message is not modified")) {
      console.error("Ошибка в renderView (sizes):", e);
    }
  }
}

module.exports = {
  name: "sizes",
  execute: async (ctx, texts) => {
    const data = ctx.callbackQuery.data.split(":")[1];

    ctx.session.history = ctx.session.history || [];
    ctx.session.history.push("sizes");

    await renderView(ctx, data, texts);
    await ctx.answerCbQuery();
  },
};
