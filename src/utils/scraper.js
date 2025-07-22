const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeProduct(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const name = $(".js-store-prod-name").text().trim();
    const imageUrl = $('[itemprop="image"]').attr("content");
    const brand = $(".js-product-brand").text().trim();

    let price;

    const scripts = $("script");
    scripts.each((i, script) => {
      const scriptContent = $(script).html();
      if (scriptContent.includes("var product =")) {
        const match = scriptContent.match(/var product = (\{[\s\S]*?\});/);
        if (match && match[1]) {
          const productDataString = match[1];
          const editionsRegex = /"editions"\s*:\s*(\[[\s\S]*?\])/;
          const editionsMatch = productDataString.match(editionsRegex);

          if (editionsMatch && editionsMatch[1]) {
            const editionsString = editionsMatch[1];
            const editionWithChainRegex =
              /\{[^{}]*?"Добавить цепочку"\s*:\s*"Да"[\s\S]*?\}/;
            const editionWithChainMatch = editionsString.match(
              editionWithChainRegex
            );

            if (editionWithChainMatch && editionWithChainMatch[0]) {
              const priceRegex = /"price"\s*:\s*"([\d\s\.]+)"/;
              const priceMatch = editionWithChainMatch[0].match(priceRegex);

              if (priceMatch && priceMatch[1]) {
                price = priceMatch[1].replace(/\s/g, "").split(".")[0];
              }
            }
          }

          if (!price) {
            const mainPriceRegex = /"price"\s*:\s*"([\d\.]+)"/;
            const mainPriceMatch = productDataString.match(mainPriceRegex);
            if (mainPriceMatch && mainPriceMatch[1]) {
              price = mainPriceMatch[1].split(".")[0];
            }
          }

          if (price) {
            return false;
          }
        }
      }
    });

    if (!price) {
      price = $(".t-store__prod-popup__price .js-product-price").attr(
        "data-product-price-def"
      );
    }

    return { name, price, imageUrl, brand };
  } catch (err) {
    console.error(`Ошибка при парсинге URL ${url}:`, err);
    return null;
  }
}

module.exports = { scrapeProduct };
