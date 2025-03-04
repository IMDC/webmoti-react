const puppeteer = require("puppeteer");
const os = require("os");
const { exec } = require("child_process");
const twilio = require("twilio");
const { format, createLogger, transports } = require("winston");
require("dotenv").config();

//
//
const isTestUser = false;
//
//

const ROOM_NAME = "Classroom";
const ROOM_TYPE = "group";

const NAMES = ["Board-View", "Student-View", "Test-User"];

// set this env variable for the student view raspberry pi
const isStudentView = process.env.IS_STUDENT_VIEW === "true";

let deviceName = NAMES[0];
if (isStudentView) {
  deviceName = NAMES[1];
} else if (isTestUser) {
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

const ERROR_CODES = {
  MISSING_ENV: 100,
  NO_INTERNET: 101,
  PUPPETEER_ERROR: 102,
};

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKey = process.env.TWILIO_API_KEY_SID;
const apiSecret = process.env.TWILIO_API_KEY_SECRET;
const conversationsServiceSid = process.env.TWILIO_CONVERSATIONS_SERVICE_SID;

const webmotiUrl = process.env.WEBMOTI_URL;

if (
  !accountSid ||
  !apiKey ||
  !apiSecret ||
  !conversationsServiceSid ||
  !webmotiUrl
) {
  logger.error("Missing environment variables");
  process.exit(ERROR_CODES.MISSING_ENV);
}

function generateVideoToken(identity, roomName) {
  logger.info("Generating video token...");
  const AccessToken = twilio.jwt.AccessToken;
  const VideoGrant = AccessToken.VideoGrant;
  const ChatGrant = AccessToken.ChatGrant;

  const token = new AccessToken(accountSid, apiKey, apiSecret, {
    identity: identity.trim(),
    ttl: 10800, // 3 hours
  });

  const videoGrant = new VideoGrant({
    room: roomName.trim(),
  });
  token.addGrant(videoGrant);

  const chatGrant = new ChatGrant({
    serviceSid: conversationsServiceSid.trim(),
  });
  token.addGrant(chatGrant);

  logger.info("Generated video token");
  return token.toJwt();
}

// from https://github.com/twilio-labs/plugin-rtc/blob/master/src/serverless/functions/token.js#L66
async function ensureRoomExists(client, roomName) {
  let room;

  try {
    // See if a room already exists
    logger.info("Fetching room...");
    room = await client.video.rooms(roomName).fetch();
    logger.info("Found room");
  } catch (e) {
    try {
      // If room doesn't exist, create it
      logger.info("Room doesn't exist");
      logger.info("Creating room...");
      room = await client.video.rooms.create({
        uniqueName: roomName,
        type: ROOM_TYPE,
      });
    } catch (e) {
      logger.error("Error creating room: " + e.message);
    }
  }

  return room;
}

// from https://github.com/twilio-labs/plugin-rtc/blob/master/src/serverless/functions/token.js#L90
async function ensureConversationExists(client, identity, room) {
  const conversationsClient = client.conversations.services(
    conversationsServiceSid
  );

  try {
    // See if conversation already exists
    logger.info("Fetching conversation...");
    await conversationsClient.conversations(room.sid).fetch();
    logger.info("Found conversation");
  } catch (e) {
    try {
      // If conversation doesn't exist, create it.
      // Here we add a timer to close the conversation after the maximum length of a room (24 hours).
      // This helps to clean up old conversations since there is a limit that a single participant
      // can not be added to more than 1,000 open conversations.
      logger.info("Conversation doesn't exist");
      logger.info("Creating conversation...");
      await conversationsClient.conversations.create({
        uniqueName: room.sid,
        "timers.closed": "P1D",
      });
    } catch (e) {
      logger.error("Error creating conversation: " + e.message);
    }
  }

  try {
    // Add participant to conversation
    logger.info("Adding participant to conversation...");
    await conversationsClient
      .conversations(room.sid)
      .participants.create({ identity: identity });
    logger.info("Added participant to conversation");
  } catch (e) {
    // Ignore "Participant already exists" error (50433)
    if (e.code !== 50433) {
      logger.error("Error adding participant to conversation: " + e.message);
    }
  }
}

function waitForInternet(timeoutMinutes = 5, intervalSeconds = 2) {
  const timeout = timeoutMinutes * 60000;
  const interval = intervalSeconds * 1000;
  logger.info("Waiting for internet...");

  const PING_COMMAND =
    os.platform() === "win32" ? "ping -n 1 8.8.8.8" : "ping -c 1 8.8.8.8";

  return new Promise((resolve) => {
    const startTime = Date.now();
    let attempt = 0;

    const checkInternet = () => {
      attempt++;
      if (attempt % 5 === 0) {
        logger.info("Connecting to internet...");
      }

      exec(PING_COMMAND, (error) => {
        if (!error) {
          logger.info("Connected to internet");
          return resolve();
        }

        if (Date.now() - startTime > timeout) {
          logger.error("Couldn't connect to internet");
          process.exit(ERROR_CODES.NO_INTERNET);
        }

        setTimeout(checkInternet, interval);
      });
    };

    checkInternet();
  });
}

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
    logger.info("Muted mic");
  }
};

const joinClassroom = async (token) => {
  logger.info("Joining classroom...");
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
      executablePath: !isTestUser ? "/usr/bin/chromium-browser" : undefined,
      // default viewport dimension leaves whitespace on right
      defaultViewport: null,
    });
    logger.info("Launched browser");

    // get current tab
    const [page] = await browser.pages();
    await page.goto(`https://${webmotiUrl}?token=${token}`);

    const joinBtnSelector = '[data-cy-join-now="true"]';
    await page.waitForSelector(joinBtnSelector, { visible: true });

    // wait until join button is enabled
    logger.info("Waiting for clickable join button...");
    await page.waitForFunction(
      (selector) => {
        const btn = document.querySelector(selector);
        return btn && !btn.disabled;
      },
      {},
      joinBtnSelector
    );

    // sleep 2s to make sure button is ready
    await new Promise((r) => setTimeout(r, 2000));

    // join meeting
    await page.click(joinBtnSelector);
    logger.info("Joined classroom");

    // mute mic for student-view only
    if (isStudentView) {
      await muteStudentViewMic(page);
    }
  } catch (e) {
    // if (browser) {
    //   await browser.close();
    // }
    logger.error("Puppeteer error: " + e.message);
    process.exit(ERROR_CODES.PUPPETEER_ERROR);
  }
};

const main = async () => {
  logger.info("");
  logger.info("--- Starting Autojoin ---");

  await waitForInternet();

  const token = generateVideoToken(deviceName, ROOM_NAME);
  const client = twilio(apiKey, apiSecret, { accountSid });

  const room = await ensureRoomExists(client, ROOM_NAME);
  await ensureConversationExists(client, deviceName, room);

  await joinClassroom(token);
};

main();
