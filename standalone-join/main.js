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

// keep trying for 3 min
// needed because rasp pi won't have wifi immediately
const WEBMOTI_MAX_RETRIES = 72;
// 2.5 seconds
const WEBMOTI_RETRY_DELAY = 2500;

const REMOTEIT_MAX_RETRIES = 10;
const REMOTEIT_RETRY_DELAY = 10000;

const authToken = process.env.TWILIO_AUTH_TOKEN;
const urlServer = `https://${process.env.URL_SERVER}`;
const remoteItEndpoint = `https://${process.env.REMOTEIT_ENDPOINT}`;

if (!authToken || !urlServer || !remoteItEndpoint) {
  console.error("Missing environment variables");
  process.exit(ERROR_CODES.MISSING_ENV);
}

const signature = crypto
  .createHmac("sha1", authToken)
  .update(Buffer.from(urlServer, "utf-8"))
  .digest("base64");

const retryRequest = async (url, headers, maxRetries, retryDelay, errMsg) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      let response;
      if (url === urlServer) {
        response = await axios.get(url, { headers: headers });
      } else {
        response = await axios.post(url, "mode=INIT", {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
      }
      return response.data;
    } catch (e) {
      console.error("Request error: ", e.message);

      // don't terminate for remote it init
      if (attempt === maxRetries && url === urlServer) {
        process.exit(ERROR_CODES.AXIOS_ERROR);
      } else {
        console.log(
          `Attempt ${attempt} failed for ${errMsg}. Retrying in ${
            retryDelay / 1000
          } seconds...`
        );
        // retry after waiting
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }
};

(async () => {
  // get url from twilio endpoint
  const webmotiData = await retryRequest(
    urlServer,
    {
      "X-Twilio-Signature": signature,
    },
    WEBMOTI_MAX_RETRIES,
    WEBMOTI_RETRY_DELAY,
    "webmoti url"
  );

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
    await page.goto(webmotiData["url"]);

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
    // it also initializes remote it

    /*
    const muteBtnSel = 'button[data-cy-audio-toggle="true"]';
    // muted button needs to load
    await page.waitForFunction(
      (selector) => !!document.querySelector(selector),
      // increase time from 30000 ms because this takes a while sometimes
      { timeout: 60000 },
      muteBtnSel
    );

    const isMuted = await page.evaluate((selector) => {
      // the svg has a group element when it's muted
      const groupSel = document.querySelector(
        `${selector} > span > span > svg > g`
      );
      return groupSel !== null;
    }, muteBtnSel);

    if (!isMuted) {
      await page.click(muteBtnSel);
    }

    // initialize remote it
    await retryRequest(
      remoteItEndpoint,
      {},
      REMOTEIT_MAX_RETRIES,
      REMOTEIT_RETRY_DELAY,
      "remote it init"
    );
    */
  } catch (e) {
    if (browser) {
      await browser.close();
    }
    console.error("Puppeteer error:", e.message);
    process.exit(ERROR_CODES.PUPPETEER_ERROR);
  }
})();
