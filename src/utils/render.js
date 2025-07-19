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

  if (ctx.session?.mediaGroupInfo) {
    const { textMessageId, mediaMessageIds } = ctx.session.mediaGroupInfo;
    await ctx.deleteMessage(textMessageId).catch(() => {});
    for (const messageId of mediaMessageIds) {
      await ctx.deleteMessage(messageId).catch(() => {});
    }
    ctx.session.mediaGroupInfo = null;
  }

  const isCurrentMessagePhoto = !!ctx.callbackQuery?.message?.photo;
  const isNextViewPhoto = !!view.photo;
  const isNextViewMediaGroup =
    Array.isArray(view.photos) && view.photos.length > 0;

  try {
    if (isNextViewMediaGroup) {
      await ctx.deleteMessage().catch(() => {});
      const mediaGroup = view.photos.map((photoPath) => ({
        type: "photo",
        media: isUrl(photoPath) ? photoPath : Input.fromLocalFile(photoPath),
      }));
      const mediaMessages = await ctx.replyWithMediaGroup(mediaGroup);
      const textMessage = await ctx.reply(view.text, options);

      ctx.session.mediaGroupInfo = {
        textMessageId: textMessage.message_id,
        mediaMessageIds: mediaMessages.map((m) => m.message_id),
      };

      return;
    }

    if (isCurrentMessagePhoto && !isNextViewPhoto) {
      await ctx.deleteMessage().catch(() => {});
      await ctx.reply(view.text, options);
      return;
    }

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
    if (
      e.description &&
      (e.description.includes("message can't be edited") ||
        e.description.includes("message to edit not found") ||
        e.description.includes("message is not modified"))
    ) {
      if (e.description.includes("message is not modified")) {
        return;
      }
      try {
        await ctx.deleteMessage().catch(() => {});
        if (isNextViewPhoto) {
          await ctx.replyWithPhoto(
            isUrl(view.photo) ? view.photo : Input.fromLocalFile(view.photo),
            {
              caption: view.text,
              ...options,
            }
          );
        } else {
          await ctx.reply(view.text, options);
        }
      } catch (err) {
        console.error("Fallback render failed:", err);
      }
    } else {
      console.error("Unhandled render error:", e);
    }
  }
}

module.exports = { renderView };
