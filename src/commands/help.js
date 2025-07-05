module.exports = {
  name: "help",
  execute: (ctx, texts) => {
    ctx.reply(texts.commands.help.reply, { parse_mode: "HTML" });
  },
};
