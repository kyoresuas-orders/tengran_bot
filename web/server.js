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

// Map to store userId and jejich WebSocket
const clients = new Map();

wss.on("connection", (ws, req) => {
  sessionParser(req, {}, () => {
    if (!req.session.loggedin) {
      ws.close();
      return;
    }

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message);

        if (data.type === "register") {
          clients.set(data.payload.userId, ws);
          ws.userId = data.payload.userId;
        }

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

          // Если открытого тикета нет, создаем новый
          if (!ticket) {
            const newTicketId = await createTicket(userId);
            ticket = { id: newTicketId };
            console.log(
              `Created new ticket #${newTicketId} for user ID ${userId}`
            );
          }

          if (ticket) {
            await saveMessage(
              ticket.id,
              process.env.SUPPORT_CHAT_ID,
              "manager",
              message
            );
            await bot.telegram.sendMessage(user.telegram_id, message);
          }
        }
      } catch (error) {
        console.error("Failed to process message or send to Telegram", error);
      }
    });

    ws.on("close", () => {
      if (ws.userId) {
        clients.delete(ws.userId);
      }
      console.log("Client disconnected");
    });

    console.log("Client connected");
  });
});

app.post("/api/message-from-bot", (req, res) => {
  const { userId, message } = req.body;
  const clientWs = clients.get(userId.toString());

  if (clientWs && clientWs.readyState === WebSocket.OPEN) {
    clientWs.send(
      JSON.stringify({
        type: "newMessage",
        payload: { userId, message },
      })
    );
    res.status(200).send("Message sent to client");
  } else {
    res.status(404).send("Client not connected");
  }
});

app.use("/", authRoutes);
app.use("/", messengerRoutes);

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
