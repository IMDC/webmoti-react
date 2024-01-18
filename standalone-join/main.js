const puppeteer = require("puppeteer-core");
const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();

// raspberry pi run on startup:
// pm2 start node main.js
// pm2 startup systemd
// copy paste outputted command
// pm2 save
// sudo reboot (to make sure it works)

const ERROR_CODES = {
  MISSING_ENV: 100,
  AXIOS_ERROR: 101,
  PUPPETEER_ERROR: 102,
};

const authToken = process.env.TWILIO_AUTH_TOKEN;
const urlServer = `https://${process.env.URL_SERVER}`;

if (!authToken || !urlServer) {
  console.error("Missing environment variables");
  process.exit(ERROR_CODES.MISSING_ENV);
}

const signature = crypto
  .createHmac("sha1", authToken)
  .update(Buffer.from(urlServer, "utf-8"))
  .digest("base64");

(async () => {
  // get url from twilio endpoint
  let URL;
  try {
    const response = await axios.get(urlServer, {
      headers: {
        "X-Twilio-Signature": signature,
      },
    });

    URL = response.data["url"];
  } catch (e) {
    if (e.response) {
      // request was made and server responded
      console.error("Error fetching URL:", e.message);
      console.error("Status:", e.response.status);
      console.error("Data:", e.response.data);
    } else if (e.request) {
      // no response was received
      console.error("Error fetching URL:", e.message);
    } else {
      // setup error
      console.error("Error:", e.message);
    }

    process.exit(ERROR_CODES.AXIOS_ERROR);
  }

  let browser;
  try {
    browser = await puppeteer.launch({
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
  } catch (e) {
    console.error("Puppeteer error:", e.message);
    process.exit(ERROR_CODES.PUPPETEER_ERROR);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
