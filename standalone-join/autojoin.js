const crypto = require("crypto");
const axios = require("axios");
const { format, createLogger, transports } = require("winston");
const puppeteer = require("puppeteer");
require("dotenv").config();

//
//
const isProfLaptop = false;
//
//

// TODO more logging in this script

const NAMES = ["Board-View", "Student-View", "Professor"];

// set this env variable for the student view raspberry pi
const isStudentView = process.env.IS_STUDENT_VIEW === "true";

let deviceName = NAMES[0];
if (isStudentView) {
  deviceName = NAMES[1];
} else if (isProfLaptop) {
  deviceName = NAMES[2];
}

const logFormat = format.printf(({ level, message, timestamp }) => {
  if (message === "") {
    return "";
  }
  return `${timestamp} ${level}: ${message}`;
});

const timestampFormat = format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" });

const logger = createLogger({
  level: "info",
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), timestampFormat, logFormat),
    }),
    new transports.File({
      filename: "autojoin.log",
      format: format.combine(timestampFormat, logFormat),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 2,
    }),
  ],
});

logger.info("");
logger.info("--- Starting Autojoin ---");

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

const authToken = process.env.TWILIO_AUTH_TOKEN;
const urlServerEnv = process.env.URL_SERVER;

if (!authToken || !urlServerEnv) {
  logger.error("Missing environment variables");
  process.exit(ERROR_CODES.MISSING_ENV);
}

const urlServer = `https://${urlServerEnv}`;

const signature = crypto
  .createHmac("sha1", authToken)
  .update(Buffer.from(urlServer, "utf-8"))
  .digest("base64");

const retryRequest = async (url, headers, maxRetries, retryDelay, errMsg) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url, { headers: headers });
      return response.data;
    } catch (e) {
      logger.error("Request error: " + e.message);

      if (attempt === maxRetries) {
        process.exit(ERROR_CODES.AXIOS_ERROR);
      } else {
        logger.info(
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

const muteStudentViewMic = async (page) => {
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
};

const clickIsProfessor = async (page, state) => {
  const profCheckboxId = "#profCheckbox";
  await page.waitForSelector(profCheckboxId);

  // event listener to handle dialog when checkbox clicked
  page.on("dialog", async (dialog) => {
    // if password is incorrect, stop script
    if (dialog.message().toLowerCase().includes("incorrect")) {
      state.shouldContinue = false;
      return;
    }
    await dialog.accept("professor123");
  });

  await page.click(profCheckboxId);
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
      args: [
        // this arg is for automatically enabling media permissions
        "--use-fake-ui-for-media-stream",
        "--start-maximized",
        // disabling WebRtcPipeWireCamera is needed for making media work on
        // raspberry pi 5 chromium browser
        "--disable-features=WebRtcPipeWireCamera",
      ],
      // needed for puppeteer core
      executablePath: !isProfLaptop ? "/usr/bin/chromium-browser" : undefined,
      // default viewport dimension leaves whitespace on right
      defaultViewport: null,
    });
    // get current tab
    const [page] = await browser.pages();
    await page.goto(webmotiData["url"]);

    if (isProfLaptop) {
      const state = { shouldContinue: true };
      await clickIsProfessor(page, state);
      if (!state.shouldContinue) {
        throw new Error("Incorrect professor password");
      }
    }

    const nameSel = "#input-user-name";
    // const roomSel = "#input-room-name";
    const btnSel = ".MuiButton-label";

    // wait until loaded
    await page.waitForSelector(nameSel);
    // await page.waitForSelector(roomSel);
    await page.waitForSelector(btnSel);

    // enter name and click continue
    await page.type(nameSel, deviceName);
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

    // mute mic for imdc1 only
    if (isStudentView) {
      await muteStudentViewMic(page);
    }
  } catch (e) {
    // if (browser) {
    //   await browser.close();
    // }
    logger.error("Puppeteer error: " + e.message);
    // don't exit because pm2 will try to restart it
    // process.exit(ERROR_CODES.PUPPETEER_ERROR);
  }
})();
