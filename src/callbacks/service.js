const {
  serviceMenuKeyboard,
  loyaltyMenuKeyboard,
  managerKeyboard,
  managerReturnKeyboard,
} = require("../data/keyboards");
const { renderView } = require("../utils/render");
const { initiateSupportFlow } = require("../utils/supportFlow");

const views = {
  loyalty_program: (texts) => ({
    text: texts.callbacks.service_submenu.loyalty_program_intro,
    keyboard: loyaltyMenuKeyboard,
  }),
  "loyalty:acquaintance": (texts) => ({
    text: texts.callbacks.service_submenu.loyalty_acquaintance,
    keyboard: managerReturnKeyboard,
  }),
  "loyalty:friend": (texts) => ({
    text: texts.callbacks.service_submenu.loyalty_friend,
    keyboard: managerReturnKeyboard,
  }),
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
    keyboard: managerReturnKeyboard,
    extra: {
      disable_web_page_preview: true,
    },
  }),
  jewelry_care: (texts) => ({
    text: texts.callbacks.service_submenu.jewelry_care_text,
    photo: "src/data/images/care.png",
    keyboard: managerReturnKeyboard,
  }),
};

module.exports = {
  name: "service",
  execute: async (ctx, texts) => {
    const data = ctx.callbackQuery.data.split(":")[1];

    if (data === "update_coating") {
      return initiateSupportFlow(ctx, texts.support_requests.update_coating);
    }
    if (data === "repair") {
      return initiateSupportFlow(ctx, texts.support_requests.repair);
    }
    if (data === "buyout") {
      return initiateSupportFlow(ctx, texts.support_requests.buyout);
    }

    // Остальная логика без изменений
    ctx.session.history = ctx.session.history || [];
    ctx.session.history.push("service");

    const view = views[data](texts);
    await renderView(ctx, view);
    await ctx.answerCbQuery();
  },
};
