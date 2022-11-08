const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const axios = require("axios");
const fs = require("fs");

var unHandled = [];
async function main() {
  let { data } = await axios.get(
    `https://www.rossmann.pl/kategoria/wlosy/pielegnacja,8656?CategoryId=8656&Page=1`
  );
  let $ = cheerio.load(data);
  const numOfPages = $(".pages__last").text();

  for (let i = 1; i <= numOfPages; i++) {
    const { data } = await axios.get(
      "https://www.rossmann.pl/kategoria/wlosy/pielegnacja,8656",
      {
        params: {
          CategoryId: 8656,
          Page: [i],
          Size: 24,
        },
      }
    );
    const $ = await cheerio.load(data);
    const paths = await $(".tile-product__name")
      .toArray()
      .map((e) => e.attribs.href)
      .filter((item) => item);
    for (let j = 0; j < paths.length; j++) {
      console.log(`Page: ${i}, Product: ${j}`);
      const productURL = `https://www.rossmann.pl${paths[j]}`;
      await fetchAndSaveData(productURL);
    }
    unHandled.push(`------- Page: ${i} -------\n`);
  }

  fs.writeFileSync("result.txt", unHandled.join(""));
}

main();

/* UTILS */

async function fetchAndSaveData(url) {
  let inci;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "load" });
  try {
    await page.waitForSelector("#onetrust-accept-btn-handler", {
      timeout: 6000,
    });
    const acceptCookies = await page.$$("#onetrust-accept-btn-handler");
    acceptCookies[0].click();
  } catch (e) {
    await browser.close();
  } finally {
    try {
      const styles = await page.$x("//style");
      styles.forEach(
        async (path) => await page.evaluate((el) => el.remove(), path)
      );
      await page.waitForXPath('//button[contains(text(), "SKŁADNIKI")]', {
        timeout: 6000,
      });
      const accordion = await page.$x(
        '//button[contains(text(), "SKŁADNIKI")]'
      );
      page.waitForTimeout(3000);
      try {
        accordion[0].click();
        const inciSectionHandler = await page.$x(
          "//div[ @class='accordion' and .//button[text()='SKŁADNIKI']]"
        );
        const inciSectionText = await page.evaluate(
          (el) => el.textContent,
          inciSectionHandler[0]
        );
        inci = inciSectionText.replace("SKŁADNIKI", "").trim();
      } catch (e) {}
      await browser.close();
    } catch (e) {
      console.log("This product doesn't have an INCI");
      unHandled.push(`Product: ${url.match(/(?<=,)[^,]+(?=,)/g)[0]}\n`);
      await browser.close();
    }
  }

  if (inci) {
    createProduct(inci, url);
  }
}

async function createProduct(inci, url) {
  const rossID = url.match(/(?<=,)[^,]+(?=,)/g)[0];
  try {
    const productInfo = await axios.get(
      `https://www.rossmann.pl/products/v2/api/Products/${rossID}`
    );
    await axios.post(
      `https://aszczepanczyk-scraper-server.herokuapp.com/product`,
      {
        ross_id: rossID,
        link: url,
        name: `${
          [productInfo.data.data.brand ?? ""] +
          " " +
          [productInfo.data.data.name ?? ""] +
          " " +
          [productInfo.data.data.caption ?? ""]
        }`,
        brand: productInfo.data.data.brand,
        category: productInfo.data.data.category,
        picture: productInfo.data.data.pictures[0].large,
        inci: inci,
      }
    );
  } catch (e) {
    console.log(e);
  }
}
