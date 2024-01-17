const puppeteer = require("puppeteer-core");
const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();

// TODO add check for missing .env variables

const authToken = process.env.TWILIO_AUTH_TOKEN;
const url_server = `https://${process.env.URL_SERVER}`;

const signature = crypto
  .createHmac("sha1", authToken)
  .update(Buffer.from(url_server, "utf-8"))
  .digest("base64");

(async () => {
  // get url from twilio endpoint
  let URL;
  try {
    const response = await axios.get(url_server, {
      headers: {
        "X-Twilio-Signature": signature,
      },
    });

    URL = response.data["url"];
  } catch (e) {
    console.error("Error fetching URL:", e);
    return;
  }

  const browser = await puppeteer.launch({
    // don't use headless mode, too hard to exit
    headless: false,
    args: ["--use-fake-ui-for-media-stream"],
    // needed for puppeteer core
    executablePath: "chromium-browser",
  });
  // get current tab
  const [page] = await browser.pages();
  await page.goto(URL);

  const nameSel = "#input-user-name";
  const roomSel = "#input-room-name";
  const btnSel = ".MuiButton-label";

  await page.waitForSelector(nameSel);
  await page.waitForSelector(roomSel);
  await page.waitForSelector(btnSel);
  
  // imdc1: Board-View
  // imdc2: Class-View
  await page.type(nameSel, "Board-View or Class-View");
  await page.type(roomSel, "Classroom");
  await page.click(btnSel);

  const btn2Sel =
    ".MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary";
  await page.waitForSelector(btn2Sel);

  await page.waitForFunction(
    (selector) =>
      !document.querySelector(selector).classList.contains("Mui-disabled"),
    {},
    btn2Sel
  );

  await page.click(btn2Sel);

  const btn3Sel =
    "#root > div > main > footer > div > div.MuiGrid-root.MuiGrid-item > div > button:nth-child(1)";
  await page.waitForSelector(btn3Sel);

  const isMicrophoneUnmuted = await page.evaluate((selector) => {
    const button = document.querySelector(selector);
    return button && !button.classList.contains("muted-class");
  }, btn3Sel);

  if (isMicrophoneUnmuted) {
    await page.click(btn3Sel);
  }
})();
