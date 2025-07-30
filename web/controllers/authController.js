const getLoginPage = (req, res) => {
  if (req.session.loggedin) {
    return res.redirect("/messenger");
  }
  res.render("login", { error: null });
};

const login = (req, res) => {
  const { password } = req.body;
  if (password === process.env.WEB_PASSWORD) {
    req.session.loggedin = true;
    res.redirect("/messenger");
  } else {
    res.render("login", { error: "Неверный пароль!" });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/messenger");
    }
    res.redirect("/");
  });
};

const getMessengerPage = (req, res) => {
  if (req.session.loggedin) {
    res.send(
      `<h1>Добро пожаловать в мессенджер</h1><a href="/logout">Выйти</a>`
    );
  } else {
    res.redirect("/");
  }
};

module.exports = {
  getLoginPage,
  login,
  logout,
  getMessengerPage,
};
