const pool = require("./connection");

const createTicket = async (userId) => {
  const [result] = await pool.execute(
    "INSERT INTO `support_tickets` (`user_id`) VALUES (?)",
    [userId]
  );
  return result.insertId;
};

const getOpenTicketByUserId = async (userId) => {
  const [rows] = await pool.execute(
    "SELECT * FROM `support_tickets` WHERE `user_id` = ? AND `status` != 'closed' LIMIT 1",
    [userId]
  );
  return rows[0] || null;
};

const getOpenTicketByManagerId = async (managerId) => {
  const [rows] = await pool.execute(
    "SELECT * FROM `support_tickets` WHERE `manager_id` = ? AND `status` = 'in_progress' LIMIT 1",
    [managerId]
  );
  return rows[0] || null;
};

const assignTicketToManager = async (ticketId, managerId) => {
  await pool.execute(
    "UPDATE `support_tickets` SET `manager_id` = ?, `status` = 'in_progress' WHERE `id` = ?",
    [managerId, ticketId]
  );
};

const closeTicket = async (ticketId) => {
  await pool.execute(
    "UPDATE `support_tickets` SET `status` = 'closed' WHERE `id` = ?",
    [ticketId]
  );
};

const saveMessage = async (ticketId, senderId, senderType, message) => {
  await pool.execute(
    "INSERT INTO `support_messages` (`ticket_id`, `sender_id`, `sender_type`, `message`) VALUES (?, ?, ?, ?)",
    [ticketId, senderId, senderType, message]
  );
};

const getTicketById = async (ticketId) => {
  const [rows] = await pool.execute(
    "SELECT t.*, u.telegram_id AS user_telegram_id FROM `support_tickets` t JOIN `users` u ON t.user_id = u.id WHERE t.id = ?",
    [ticketId]
  );
  return rows[0] || null;
};

const getMessagesByTicketId = async (ticketId) => {
  const [rows] = await pool.execute(
    "SELECT * FROM `support_messages` WHERE `ticket_id` = ? ORDER BY `created_at` ASC",
    [ticketId]
  );
  return rows;
};

module.exports = {
  createTicket,
  getOpenTicketByUserId,
  getOpenTicketByManagerId,
  assignTicketToManager,
  closeTicket,
  saveMessage,
  getTicketById,
  getMessagesByTicketId,
};
