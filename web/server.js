require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

app.use("/", authRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
