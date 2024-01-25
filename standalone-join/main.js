const puppeteer = require("puppeteer-core");
const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();

// raspberry pi run on startup:
// pm2 start main.js
// pm2 startup systemd
// copy paste outputted command
// pm2 save
// sudo reboot (to make sure it works)

// edits needed:
// line 108: Board-View or Class-View
// line 130: (if imdc2) Uncomment

const ERROR_CODES = {
  MISSING_ENV: 100,
  AXIOS_ERROR: 101,
  PUPPETEER_ERROR: 102,
};

// for axios (keep trying for 3 min)
// needed because rasp pi won't have wifi immediately
const MAX_RETRIES = 72;
// 2.5 seconds
const RETRY_DELAY = 2500;

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
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(urlServer, {
        headers: {
          "X-Twilio-Signature": signature,
        },
      });

      URL = response.data["url"];
      // break loop if successful
      break;
    } catch (e) {
      // log error each time
      if (e.response) {
        console.error("Error fetching URL: ", e.message);
        console.error("Status: ", e.response.status);
        console.error("Data: ", e.response.data);
      } else if (e.request) {
        console.error("Error fetching URL (no response received): ", e.message);
      } else {
        console.error("Error setting up request: ", e.message);
      }

      if (attempt === MAX_RETRIES) {
        process.exit(ERROR_CODES.AXIOS_ERROR);
      } else {
        console.log(
          `Attempt ${attempt} failed. Retrying in ${
            RETRY_DELAY / 1000
          } seconds...`
        );
        // retry after waiting
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
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
    // const roomSel = "#input-room-name";
    const btnSel = ".MuiButton-label";

    // wait until loaded
    await page.waitForSelector(nameSel);
    // await page.waitForSelector(roomSel);
    await page.waitForSelector(btnSel);

    // model: Raspberry Pi 4 Model B Rev 1.5
    // imdc1: Board-View (Hand)
    // imdc2: Class-View (Directional mic)
    // enter name and room, click continue
    await page.type(nameSel, "Board-View or Class-View");
    // Classroom is already there by default
    // await page.type(roomSel, "Classroom");
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

    // uncomment the following code to mute mic for imdc1 only

    /*
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
    */
  } catch (e) {
    if (browser) {
      await browser.close();
    }
    console.error("Puppeteer error:", e.message);
    process.exit(ERROR_CODES.PUPPETEER_ERROR);
  }
})();
