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

const saveMessage = async (
  ticketId,
  senderId,
  senderType,
  message,
  attachmentUrl = null,
  attachmentType = null
) => {
  await pool.execute(
    "INSERT INTO `support_messages` (`ticket_id`, `sender_id`, `sender_type`, `message`, `attachment_url`, `attachment_type`) VALUES (?, ?, ?, ?, ?, ?)",
    [ticketId, senderId, senderType, message, attachmentUrl, attachmentType]
  );
};

const setTicketSupportChatMessageId = async (ticketId, messageId) => {
  await pool.execute(
    "UPDATE `support_tickets` SET `support_chat_message_id` = ? WHERE `id` = ?",
    [messageId, ticketId]
  );
};

const getTicketById = async (ticketId) => {
  const [rows] = await pool.execute(
    "SELECT t.*, u.telegram_id AS user_telegram_id, u.first_name AS user_first_name FROM `support_tickets` t JOIN `users` u ON t.user_id = u.id WHERE t.id = ?",
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

const getMessagesByUserId = async (userId) => {
  const [rows] = await pool.execute(
    "SELECT sm.*, st.id as ticket_id FROM support_messages sm JOIN support_tickets st ON sm.ticket_id = st.id WHERE st.user_id = ? ORDER BY sm.created_at ASC",
    [userId]
  );
  return rows;
};

const getChats = async () => {
  const [rows] = await pool.execute(`
    SELECT
        u.id AS user_id,
        u.first_name AS user_first_name,
        latest_message.message AS last_message,
        latest_message.created_at AS last_message_time,
        latest_message.sender_type AS last_sender_type,
        t.status AS ticket_status
    FROM
        users u
    JOIN (
        SELECT 
            st.user_id,
            MAX(st.id) AS max_ticket_id
        FROM support_tickets st
        GROUP BY st.user_id
    ) AS latest_ticket ON u.id = latest_ticket.user_id
    JOIN support_tickets t ON latest_ticket.max_ticket_id = t.id
    LEFT JOIN (
        SELECT 
            sm.ticket_id,
            sm.message,
            sm.created_at,
            sm.sender_type,
            ROW_NUMBER() OVER(PARTITION BY sm.ticket_id ORDER BY sm.created_at DESC) as rn
        FROM support_messages sm
    ) AS latest_message ON t.id = latest_message.ticket_id AND latest_message.rn = 1
    WHERE
        EXISTS (SELECT 1 FROM support_tickets st WHERE st.user_id = u.id)
    ORDER BY
        CASE 
            WHEN t.status = 'closed' THEN 1
            ELSE 0
        END,
        last_message_time DESC
  `);
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
  setTicketSupportChatMessageId,
  getChats,
  getMessagesByUserId,
};
