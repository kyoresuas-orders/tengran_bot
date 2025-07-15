const { managerKeyboard, backKeyboard } = require("../data/keyboards");

const views = {
  update_coating: (texts) => ({
    text: texts.callbacks.service_submenu.update_coating_text,
    keyboard: managerKeyboard,
  }),
  repair: (texts) => ({
    text: texts.callbacks.service_submenu.repair_text,
    keyboard: managerKeyboard,
  }),
  buyout: (texts) => ({
    text: texts.callbacks.service_submenu.buyout_text,
    keyboard: managerKeyboard,
  }),
  return_policy: (texts) => ({
    text: texts.callbacks.service_submenu.return_policy_text,
    keyboard: managerKeyboard,
  }),
  jewelry_care: (texts) => ({
    text: texts.callbacks.service_submenu.jewelry_care_text,
    keyboard: backKeyboard,
  }),
};

async function renderView(ctx, viewName, texts) {
  const view = views[viewName] ? views[viewName](texts) : null;

  if (!view) {
    console.error(`Экран сервиса не найден: ${viewName}`);
    return;
  }

  try {
    await ctx.editMessageText(view.text, view.keyboard);
  } catch (e) {
    if (e.description && !e.description.includes("message is not modified")) {
      console.error("Ошибка в renderView (service):", e);
    }
  }
}

module.exports = {
  name: "service",
  execute: async (ctx, texts) => {
    const data = ctx.callbackQuery.data.split(":")[1];

    ctx.session.history = ctx.session.history || [];
    ctx.session.history.push("service");

    await renderView(ctx, data, texts);
    await ctx.answerCbQuery();
  },
};
