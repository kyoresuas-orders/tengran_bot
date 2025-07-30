require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const { WebSocketServer } = require("ws");
const session = require("express-session");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const messengerRoutes = require("./routes/messengerRoutes");
const {
  saveMessage,
  getOpenTicketByUserId,
  createTicket,
} = require("../src/database/tickets");
const { findUserByDbId } = require("../src/database/users");
const { Telegraf } = require("telegraf");

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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Для парсинга JSON-тела от бота
app.use(sessionParser);

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
  const { userId, message } = req.body;

  let clientFound = false;
  app.locals.managerWebsockets.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "newMessage",
          payload: { userId, message },
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
