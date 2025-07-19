const { managerKeyboard, backKeyboard } = require("../data/keyboards");
const { renderView } = require("../utils/render");

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
    photo: "src/images/care.png",
    keyboard: backKeyboard,
  }),
};

module.exports = {
  name: "service",
  execute: async (ctx, texts) => {
    const data = ctx.callbackQuery.data.split(":")[1];

    ctx.session.history = ctx.session.history || [];
    ctx.session.history.push("service");

    const view = views[data](texts);
    await renderView(ctx, view);
    await ctx.answerCbQuery();
  },
};
