const { mainMenuKeyboard, supportKeyboard } = require("../data/keyboards");
const { Markup } = require("telegraf");

function registerHandlers(bot, texts) {
  // Обработка текстовых сообщений, которые не являются командами
  bot.on("text", async (ctx) => {
    if (ctx.session && ctx.session.awaitingSupportMessage) {
      // Если диалог с поддержкой уже начался
      if (ctx.session.supportChatStarted) {
        if (ctx.message.text === "Завершить диалог") {
          ctx.session.awaitingSupportMessage = false;
          ctx.session.supportChatStarted = false;
          await ctx.reply(
            "Диалог с поддержкой завершен.",
            Markup.removeKeyboard()
          );
          await ctx.reply(texts.commands.start.authorized, mainMenuKeyboard);
          return;
        }
        return ctx.reply(ctx.message.text);
      } else {
        // Первое сообщение от пользователя
        ctx.session.supportChatStarted = true;

        // Убираем инлайн-кнопку "Назад"
        if (ctx.session.supportMessageId) {
          try {
            await ctx.telegram.editMessageReplyMarkup(
              ctx.chat.id,
              ctx.session.supportMessageId,
              undefined,
              undefined
            );
            ctx.session.supportMessageId = null;
          } catch (e) {
            console.error("Не удалось убрать инлайн-клавиатуру:", e);
          }
        }

        // Отправляем клавиатуру "Завершить диалог" и повторяем сообщение
        await ctx.reply("Ваш диалог с поддержкой начат.", supportKeyboard);
        return ctx.reply(ctx.message.text);
      }
    }

    ctx.replyWithHTML(texts.errors.unknown_command);
  });
}

module.exports = registerHandlers;
