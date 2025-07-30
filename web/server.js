require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const { WebSocketServer, WebSocket } = require("ws");
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const authRoutes = require("./routes/authRoutes");
const messengerRoutes = require("./routes/messengerRoutes");
const {
  saveMessage,
  getOpenTicketByUserId,
} = require("../src/database/tickets");
const { findUserByDbId } = require("../src/database/users");
const { Telegraf } = require("telegraf");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "web/public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const bot = new Telegraf(process.env.BOT_TOKEN);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.locals.wss = wss; // Make wss available to controllers
app.locals.managerWebsockets = new Set(); // Use Set from app.locals

const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionParser = session({
  secret: process.env.SESSION_SECRET || "your_secret_key",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === "production" },
});

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(sessionParser);

app.post("/api/message", upload.array("attachment", 10), async (req, res) => {
  if (!req.session.loggedin) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { userId, message, tempId } = req.body;
  const user = await findUserByDbId(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  let ticket = await getOpenTicketByUserId(userId);
  if (!ticket) {
    return res.status(400).json({ error: "No open ticket for this user" });
  }

  const attachments = req.files;
  if (!message && (!attachments || attachments.length === 0)) {
    return res.status(400).json({ error: "Message or attachment is required" });
  }
  try {
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        const attachmentUrl = `/uploads/${attachment.filename}`;
        const attachmentType = attachment.mimetype.startsWith("image")
          ? "photo"
          : "video";

        // For the first attachment, send the message text. For others, send only the file.
        const messageToSend =
          attachments.indexOf(attachment) === 0 ? message || null : null;

        await saveMessage(
          ticket.id,
          process.env.SUPPORT_CHAT_ID,
          "manager",
          messageToSend,
          attachmentUrl,
          attachmentType
        );

        const { supportKeyboard } = require("../src/data/keyboards");
        if (attachmentType === "photo") {
          await bot.telegram.sendPhoto(
            user.telegram_id,
            { source: fs.createReadStream(attachment.path) },
            { caption: messageToSend, ...supportKeyboard }
          );
        } else if (attachmentType === "video") {
          await bot.telegram.sendVideo(
            user.telegram_id,
            { source: fs.createReadStream(attachment.path) },
            { caption: messageToSend, ...supportKeyboard }
          );
        }

        const wss = req.app.locals.wss;
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "newMessage",
                payload: {
                  userId,
                  message: messageToSend,
                  attachmentUrl,
                  attachmentType,
                  sender_type: "manager",
                  tempId: attachments.indexOf(attachment) === 0 ? tempId : null,
                },
              })
            );
          }
        });
      }
    } else if (message) {
      await saveMessage(
        ticket.id,
        process.env.SUPPORT_CHAT_ID,
        "manager",
        message,
        null,
        null
      );
      const { supportKeyboard } = require("../src/data/keyboards");
      await bot.telegram.sendMessage(
        user.telegram_id,
        message,
        supportKeyboard
      );
      const wss = req.app.locals.wss;
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "newMessage",
              payload: {
                userId,
                message,
                attachmentUrl: null,
                attachmentType: null,
                sender_type: "manager",
                tempId: tempId,
              },
            })
          );
        }
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Failed to send message", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

wss.on("connection", (ws, req) => {
  sessionParser(req, {}, () => {
    if (!req.session.loggedin) {
      ws.close();
      return;
    }

    app.locals.managerWebsockets.add(ws);
    console.log(
      "Manager client connected. Total clients:",
      app.locals.managerWebsockets.size
    );

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message);

        if (data.type === "sendMessage") {
          const { userId, message } = data.payload;
          const user = await findUserByDbId(userId);

          if (!user) {
            console.error(
              `Attempted to send message to non-existent user with DB ID: ${userId}`
            );
            return;
          }

          let ticket = await getOpenTicketByUserId(userId);

          if (ticket) {
            await saveMessage(
              ticket.id,
              process.env.SUPPORT_CHAT_ID,
              "manager",
              message
            );
            const { supportKeyboard } = require("../src/data/keyboards");
            await bot.telegram.sendMessage(
              user.telegram_id,
              message,
              supportKeyboard
            );
          } else {
            console.log(
              `Manager tried to message user ${userId} without an open ticket.`
            );
            ws.send(
              JSON.stringify({
                type: "error",
                payload: {
                  message: "Нельзя написать пользователю без открытого тикета.",
                },
              })
            );
          }
        }
      } catch (error) {
        console.error("Failed to process message or send to Telegram", error);
      }
    });

    ws.on("close", () => {
      app.locals.managerWebsockets.delete(ws);
      console.log(
        "Manager client disconnected. Total clients:",
        app.locals.managerWebsockets.size
      );
    });
  });
});

app.post("/api/ticket-closed-by-user", (req, res) => {
  const { userId } = req.body;

  app.locals.managerWebsockets.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "ticketClosed",
          payload: { userId },
        })
      );
    }
  });

  res.status(200).send("Notification sent");
});

app.post("/api/message-from-bot", (req, res) => {
  const { userId, message, attachmentUrl, attachmentType } = req.body;

  let clientFound = false;
  req.app.locals.managerWebsockets.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "newMessage",
          payload: {
            userId,
            message,
            attachmentUrl,
            attachmentType,
            sender_type: "user",
          },
        })
      );
      clientFound = true;
    }
  });

  if (clientFound) {
    res.status(200).send("Message sent to client(s)");
  } else {
    res.status(404).send("No manager clients connected");
  }
});

app.use("/", authRoutes);
app.use("/", messengerRoutes);

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
