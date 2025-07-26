const path = require("path");
const { sizesMenuKeyboard, managerKeyboard } = require("../data/keyboards");
const { renderView } = require("../utils/render");
const { initiateSupportFlow } = require("../utils/supportFlow");

const views = {
  determine: (texts) => ({
    text: texts.callbacks.sizes_submenu.determine_text,
    keyboard: backKeyboard,
    photo: path.resolve(__dirname, "..", "data", "images", "sizes.png"),
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

    if (data === "history") {
      return initiateSupportFlow(ctx, texts.support_requests.sizes_history);
    }

    // Остальная логика без изменений
    if (data === "determine") {
      await renderView(ctx, {
        text: texts.callbacks.sizes_submenu.determine_text,
        photo: "src/data/images/sizes.png",
        keyboard: managerKeyboard,
      });
    }

    await ctx.answerCbQuery();
  },
};
