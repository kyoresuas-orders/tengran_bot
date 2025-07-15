const path = require("path");
const { Input } = require("telegraf");
const { backKeyboard } = require("../data/keyboards");

const views = {
  determine: (texts) => ({
    text: texts.callbacks.sizes_submenu.determine_text,
    keyboard: backKeyboard,
    photo: path.resolve(__dirname, "..", "images", "sizes.png"),
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
    if (view.photo) {
      try {
        await ctx.editMessageMedia(
          {
            type: "photo",
            media: Input.fromLocalFile(view.photo),
            caption: view.text,
          },
          view.keyboard
        );
      } catch (e) {
        if (e.description.includes("message can't be edited")) {
          await ctx.deleteMessage();
          await ctx.replyWithPhoto(Input.fromLocalFile(view.photo), {
            caption: view.text,
            ...view.keyboard,
          });
        } else {
          throw e;
        }
      }
    } else {
      await ctx.editMessageText(view.text, view.keyboard);
    }
  } catch (e) {
    if (e.description && !e.description.includes("message is not modified")) {
      console.error("Ошибка в renderView (sizes):", e);
    } else if (
      e.description &&
      e.description.includes("message to delete not found")
    ) {
      // ignore, message already deleted
    } else if (!e.description) {
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
