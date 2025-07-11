const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeProduct(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const name = $(".js-store-prod-name").text().trim();
    const price = $(".js-product-price").text().trim();
    const imageUrl = $('[itemprop="image"]').attr("content");
    const brand = $(".js-product-brand").text().trim();

    return { name, price, imageUrl, brand };
  } catch (err) {
    console.error(`Ошибка при парсинге URL ${url}:`, err);
    return null;
  }
}

module.exports = { scrapeProduct };
