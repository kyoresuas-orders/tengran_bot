const express = require("express");
const router = express.Router();
const messengerController = require("../controllers/messengerController");
const { requireLogin } = require("../middleware/authMiddleware");

router.get("/messenger", requireLogin, messengerController.getMessengerPage);
router.get(
  "/messenger/chat/:userId",
  requireLogin,
  messengerController.getChat
);
router.post(
  "/messenger/chat/:userId/close",
  requireLogin,
  messengerController.closeChatTicket
);

module.exports = router;
