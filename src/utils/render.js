const { Input } = require("telegraf");

function isUrl(path) {
  if (!path || typeof path !== "string") return false;
  return path.startsWith("http");
}

async function renderView(ctx, view) {
  if (!view) {
    console.error(`View not found or provided.`);
    return;
  }

  const keyboard = view.keyboard ? { ...view.keyboard } : {};
  const options = view.options
    ? { ...view.options, ...keyboard }
    : { ...keyboard };

  const isCurrentMessagePhoto = !!ctx.callbackQuery.message.photo;
  const isNextViewPhoto = !!view.photo;

  try {
    // Главный проблемный случай: переход от фото к тексту
    if (isCurrentMessagePhoto && !isNextViewPhoto) {
      await ctx.deleteMessage().catch(() => {});
      await ctx.reply(view.text, options);
      return;
    }

    // Все остальные случаи можно попробовать отредактировать
    if (isNextViewPhoto) {
      const media = {
        type: "photo",
        media: isUrl(view.photo) ? view.photo : Input.fromLocalFile(view.photo),
        caption: view.text,
        ...view.options,
      };
      await ctx.editMessageMedia(media, keyboard);
    } else {
      await ctx.editMessageText(view.text, options);
    }
  } catch (e) {
    // Если редактирование не удалось, всегда можно откатиться к удалению и отправке нового
    if (
      e.description &&
      (e.description.includes("message can't be edited") ||
        e.description.includes("message to edit not found"))
    ) {
      try {
        await ctx.deleteMessage().catch(() => {});
        if (isNextViewPhoto) {
          const media = {
            type: "photo",
            media: isUrl(view.photo)
              ? view.photo
              : Input.fromLocalFile(view.photo),
            caption: view.text,
            ...view.options,
          };
          await ctx.replyWithPhoto(media.media, {
            caption: media.caption,
            ...options,
          });
        } else {
          await ctx.reply(view.text, options);
        }
      } catch (err) {
        console.error("Fallback render failed:", err);
      }
    } else if (
      e.description &&
      !e.description.includes("message is not modified")
    ) {
      console.error("Unhandled render error:", e);
    }
  }
}

module.exports = { renderView };
