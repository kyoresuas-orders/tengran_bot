const pool = require("./connection");

/**
 * Находит пользователя по его Telegram ID
 */
const findUserById = async (telegramId) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM `users` WHERE `telegram_id` = ?",
      [telegramId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Ошибка в findUserById:", error);
    throw error;
  }
};

/**
 * Создает нового пользователя в базе данных
 */
const createUser = async (user) => {
  const { id, first_name, last_name, username, language_code } = user;
  try {
    const [result] = await pool.execute(
      "INSERT INTO `users` (`telegram_id`, `first_name`, `last_name`, `username`, `language_code`) VALUES (?, ?, ?, ?, ?)",
      [
        id,
        first_name,
        last_name || null,
        username || null,
        language_code || null,
      ]
    );
    return result;
  } catch (error) {
    console.error("Ошибка в createUser:", error);
    throw error;
  }
};

/**
 * Проверяет, является ли пользователь администратором
 */
const isAdmin = async (telegramId) => {
  try {
    const user = await findUserById(telegramId);
    return user ? user.is_admin === 1 : false;
  } catch (error) {
    console.error("Ошибка в isAdmin:", error);
    throw error;
  }
};

/**
 * Получает всех пользователей из базы данных
 */
const getAllUsers = async () => {
  try {
    const [rows] = await pool.execute("SELECT * FROM `users`");
    return rows;
  } catch (error) {
    console.error("Ошибка в getAllUsers:", error);
    throw error;
  }
};

module.exports = {
  findUserById,
  createUser,
  isAdmin,
  getAllUsers,
};
