const {
  managerKeyboard,
  managerReturnKeyboard,
  serviceBackKeyboard,
  loyaltyMenuKeyboard,
} = require("../data/keyboards");
const { renderView } = require("../utils/render");

const views = {
  loyalty_program: (texts) => ({
    text: texts.callbacks.service_submenu.loyalty_program_intro,
    keyboard: loyaltyMenuKeyboard,
  }),
  "loyalty:acquaintance": (texts) => ({
    text: texts.callbacks.service_submenu.loyalty_acquaintance,
    keyboard: serviceBackKeyboard,
  }),
  "loyalty:friend": (texts) => ({
    text: texts.callbacks.service_submenu.loyalty_friend,
    keyboard: serviceBackKeyboard,
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
    keyboard: serviceBackKeyboard,
  }),
};

module.exports = {
  name: "service",
  execute: async (ctx, texts) => {
    const data = ctx.callbackQuery.data.split(":")[1];
    const subAction = ctx.callbackQuery.data.split(":")[2];
    const action = subAction ? `${data}:${subAction}` : data;

    const view = views[action](texts);
    if (!view) {
      console.error(`View for action "${action}" not found.`);
      return ctx.answerCbQuery("Произошла ошибка");
    }
    await renderView(ctx, view);
    await ctx.answerCbQuery();
  },
};
