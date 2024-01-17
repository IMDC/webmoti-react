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

  // wait until loaded
  await page.waitForSelector(nameSel);
  await page.waitForSelector(roomSel);
  await page.waitForSelector(btnSel);

  // model: Raspberry Pi 4 Model B Rev 1.5
  // imdc1: Board-View
  // imdc2: Class-View
  // enter name and room, click continue
  await page.type(nameSel, "Board-View or Class-View");
  await page.type(roomSel, "Classroom");
  await page.click(btnSel);

  // ui changes here and join button appears
  const btn2Sel =
    ".MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary";
  await page.waitForSelector(btn2Sel);

  // wait until join button is enabled
  await page.waitForFunction(
    (selector) =>
      !document.querySelector(selector).classList.contains("Mui-disabled"),
    {},
    btn2Sel
  );

  // join meeting
  await page.click(btn2Sel);

  // the following code to mute mic is only for imdc2
  // comment it out for imdc1

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
