module.exports = {
  name: "start",
  execute: (ctx, texts) => {
    ctx.reply(texts.commands.start.reply, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [{ text: "Главное меню", callback_data: "menu:main" }],
          [{ text: "Настройки", callback_data: "menu:settings" }],
        ],
      },
    });
  },
};
