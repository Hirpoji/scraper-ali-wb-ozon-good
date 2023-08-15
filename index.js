const puppeteer = require("puppeteer");

const links = [
  "https://www.wildberries.ru/catalog/146253326/detail.aspx?targetUrl=EX",
  "https://www.wildberries.ru/catalog/91345726/detail.aspx",
  "https://aliexpress.ru/item/1005004929042576.html?spm=a2g2w.home.10009201.41.75df5931TYOlDS&mixer_rcmd_bucket_id=aerabtestalgoRecommendAbV4_testBoostFbaItemsCoeff12&ru_algo_pv_id=ebf95a-ed37dc-902a4f-9725ba&scenario=aerAppJustForYouNewRuGoldenItemsTab&sku_id=12000031054964161&tpp_rcmd_bucket_id=1&type_rcmd=core",
  "https://www.ozon.ru/product/komplekt-polok-nastennaya-pryamaya-contour-45h15h10-sm-3-sht-580724459/?_bctx=CAQQ-u4T&asb=AJc57FZO9NWlTccLGNl44NO2eUFY0tA7KTVXV4JCpHVsk7GSwl5shjXQn7TLLyfX&asb2=2jZKe--y2hiLAhT1H7NfOl5F3rnoYVgi5lkCsXTxpi-W4x_EpFZdTA_j0Blz_pDPAqStT7PZ261z7KJxd7jFRImgQ-kwQbOoej7hIyuQpgvdal6i5xmGf3CzPVYzsGgklDJLfZV0oJdUfQ__e1PSY_h09WCmmvZ01OQ3mcfRxbE&avtc=1&avte=2&avts=1692095735&hs=1&miniapp=seller_325498&sh=c0hG5rnqeQ",
];

const scrapeAliexpress = async (page, item) => {
  await page.goto(item, { waitUntil: "load" });

  await page.waitForSelector("#reviews_anchor");

  const html = await page.evaluate(() => {
    let good = {};
    try {
      const url = window.location.href;
      const regex = /item\/(\d+)\.html/;
      const match = url.match(regex);
      const articleNumber = match && match[1] ? match[1] : "";

      good = {
        title: document.querySelector("h1").innerText,
        link: url,
        vendorCode: articleNumber,
        img: document
          .querySelector(".gallery_Gallery__image__1gsooe")
          .getAttribute("src"),
        price: document
          .querySelector(".snow-price_SnowPrice__mainS__jlh6el")
          .innerText.replace(/\s+/g, " ")
          .trim(),
      };
    } catch (error) {
      console.log(error);
    }

    return good;
  });

  return html;
};

const scrapeWildberries = async (page, item) => {
  await page.goto(item, { waitUntil: "load" });

  await page.waitForSelector(".user-activity");

  const html = await page.evaluate(() => {
    let good;
    try {
      good = {
        title: document.querySelector("h1").innerText,
        link: window.location.href,
        vendorCode: document.querySelector("#productNmId").innerText,
        img: document.querySelector('[alt=" Вид 1."]').getAttribute("src"),
        price: document
          .querySelector(".price-block__final-price")
          .innerText.replace(/\s+/g, " ")
          .trim(),
      };
    } catch (error) {
      console.log(error);
    }

    return good;
  });

  return html;
};

const scrapeOzon = async (page, item) => {
  await page.goto(item, { waitUntil: "load" });

  await page.waitForSelector(".a2-a4");

  const html = await page.evaluate(() => {
    let good;
    try {
      good = {
        title: document.querySelector("h1").innerText,
        link: window.location.href,
        vendorCode: "",
        img: document
          .querySelector("div.kj0")
          .querySelector("img")
          .getAttribute("src"),
        price: document
          .querySelector(".w4k")
          .innerText.replace(/\s+/g, " ")
          .trim(),
      };
    } catch (error) {
      console.log(error);
    }

    return good;
  });

  return html;
};

(async () => {
  const res = [];

  try {
    const browser = await puppeteer.launch({
      headless: false,
    });

    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(600000);

    await page.setViewport({
      width: 1400,
      height: 900,
    });

    for (const item of links) {
      if (item.includes("wildberries.ru")) {
        const html = await scrapeWildberries(page, item);
        res.push(html);
      }

      if (item.includes("aliexpress.ru")) {
        const html = await scrapeAliexpress(page, item);
        res.push(html);
      }

      if (item.includes("ozon.ru")) {
        const html = await scrapeOzon(page, item);
        res.push(html);
      }
    }
  } catch (error) {
    console.log(error);
  }

  console.log(res);
})();
