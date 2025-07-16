const path = require("path");
const { backKeyboard, managerKeyboard } = require("../data/keyboards");
const { renderView } = require("../utils/render");

const views = {
  determine: (texts) => ({
    text: texts.callbacks.sizes_submenu.determine_text,
    keyboard: backKeyboard,
    photo: path.resolve(__dirname, "..", "images", "sizes.png"),
  }),
  history: (texts) => ({
    text: texts.callbacks.sizes_submenu.history_text,
    keyboard: managerKeyboard,
  }),
};

module.exports = {
  name: "sizes",
  execute: async (ctx, texts) => {
    const data = ctx.callbackQuery.data.split(":")[1];

    ctx.session.history = ctx.session.history || [];
    ctx.session.history.push("sizes");

    const view = views[data](texts);
    await renderView(ctx, view);
    await ctx.answerCbQuery();
  },
};
