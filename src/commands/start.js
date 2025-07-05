module.exports = {
  name: "start",
  execute: (ctx, texts) => {
    ctx.reply(texts.commands.start.reply, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  },
};
