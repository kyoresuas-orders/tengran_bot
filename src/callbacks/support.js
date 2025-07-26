const { supportBackKeyboard } = require("../data/keyboards");

module.exports = {
  name: "support",
  async execute(ctx) {
    ctx.session.awaitingSupportMessage = true;
    const message = await ctx.editMessageText(
      ctx.texts.support.request,
      supportBackKeyboard
    );

    ctx.session.supportMessageId = message.message_id;
  },
};
