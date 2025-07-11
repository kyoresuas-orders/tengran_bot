const axios = require("axios");

const api = axios.create({
  baseURL: process.env.RETAILCRM_URL,
  params: {
    apiKey: process.env.RETAILCRM_API_KEY,
  },
  timeout: 10000,
});

/**
 * Создание чата в RetailCRM по внешнему идентификатору
 */
async function createChat({ externalId, user }) {
  try {
    const { data } = await api.post("/api/v5/online-chats/create", {
      externalId: String(externalId),
      firstName: user.first_name,
      lastName: user.last_name,
      nickname: user.username,
      source: "telegram",
    });

    return data;
  } catch (err) {
    console.error(
      "[RetailCRM] Ошибка при создании чата:",
      err.response?.data || err.message
    );
    throw err;
  }
}

module.exports = {
  createChat,
};
