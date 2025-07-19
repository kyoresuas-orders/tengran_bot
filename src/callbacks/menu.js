const {
  backKeyboard,
  mainMenuKeyboard,
  houseMenuKeyboard,
  sizesMenuKeyboard,
  serviceMenuKeyboard,
  jewelryMenuKeyboard,
  managerKeyboard,
} = require("../data/keyboards");
const { renderView } = require("../utils/render");

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
    photos: [
      "src/images/concept/1.jpeg",
      "src/images/concept/2.jpeg",
      "src/images/concept/3.jpeg",
      "src/images/concept/4.jpeg",
      "src/images/concept/5.jpeg",
      "src/images/concept/6.jpeg",
    ],
    keyboard: backKeyboard,
  }),
  house_address: (texts) => ({
    text: texts.callbacks.house_submenu.address,
    photo: "src/images/address.png",
    keyboard: backKeyboard,
  }),
  house_exhibition: (texts) => ({
    text: texts.callbacks.house_submenu.exhibition,
    photos: ["src/images/exhibition/1.jpeg", "src/images/exhibition/2.jpeg"],
    keyboard: backKeyboard,
  }),
  about: (texts) => ({
    text: texts.callbacks.menu.about,
    photo: "src/images/about.png",
    keyboard: backKeyboard,
  }),
  jewelry: (texts) => ({
    text: texts.callbacks.jewelry_submenu.intro,
    keyboard: jewelryMenuKeyboard,
  }),
  sizes: (texts) => ({
    text: texts.callbacks.sizes_submenu.intro,
    keyboard: sizesMenuKeyboard,
  }),
  service: (texts) => ({
    text: texts.callbacks.service_submenu.intro,
    keyboard: serviceMenuKeyboard,
  }),
  status: (texts) => ({
    text: texts.callbacks.status_text,
    keyboard: managerKeyboard,
  }),
};

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
      const lastViewName = ctx.session.history.pop() || "main";
      const view = views[lastViewName](texts);
      await renderView(ctx, view);
    } else {
      const currentView = parentMap[data];
      if (currentView) {
        ctx.session.history.push(currentView);
      }
      const view = views[data](texts);
      await renderView(ctx, view);
    }
    await ctx.answerCbQuery();
  },
};
