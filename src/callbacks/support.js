const { supportKeyboard } = require("../data/keyboards");

module.exports = {
  name: "support",
  async execute(ctx) {
    ctx.session.awaitingSupportMessage = true;
    await ctx.deleteMessage();
    await ctx.reply(ctx.texts.support.request, supportKeyboard);
  },
};
