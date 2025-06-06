import puppeteer from 'puppeteer';

const participants = {};

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing).
// `on` is used to hook into various events Cypress emits
// `config` is the resolved Cypress config
export default (on, config) => {
  const participantFunctions = {
    addParticipant: async ({ name, roomName, color }) => {
      const args = ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--window-size=1920,1080`];

      if (color) {
        args.push(`--use-file-for-fake-video-capture=cypress/fixtures/${color}.y4m`);
      }

      const browser = await puppeteer.launch({
        headless: true,
        args,
      });
      const page = (participants[name] = await browser.newPage()); // keep track of this participant for future use

      // These tests were written before Gallery View was implemented. This app now activates
      // Gallery View by default, so here we activate Speaker View before visiting the app so
      // that the tests can pass.
      await page.evaluateOnNewDocument(() => {
        localStorage.clear();
        localStorage.setItem('gallery-view-active-key', false);
      });
      await page.goto(config.baseUrl);
      await page.type('#input-user-name', name);
      // clear "Classroom" from room name
      await page.focus('#input-room-name');
      await page.evaluate(() => (document.querySelector('#input-room-name').value = ''));
      await page.type('#input-room-name', roomName);
      await page.click('[type="submit"]');
      await page.waitForSelector('[data-cy-join-now]:not([disabled])');
      await page.click('[data-cy-join-now]');
      await page.waitForSelector('[data-cy-main-participant] video');
      return null;
    },

    toggleParticipantAudio: async (name) => {
      const page = participants[name];
      await page.click('[data-cy-audio-toggle]');
      return null;
    },

    shareParticipantScreen: async (name) => {
      const page = participants[name];
      await page.click('[data-cy-share-screen]');
      return null;
    },

    removeParticipant: async (name) => {
      const page = participants[name];
      await page.click('[data-cy-disconnect]');
      await page.close();
      delete participants[name];
      return null;
    },

    removeAllParticipants: async () => {
      await Promise.all(Object.keys(participants).map((name) => participantFunctions.removeParticipant(name)));
      return null;
    },

    participantCloseBrowser: async (name) => {
      const page = participants[name];
      await page.close({ runBeforeUnload: true });
      delete participants[name];
      return null;
    },

    sendAMessage: async ({ message, name }) => {
      const page = participants[name];
      await page.click('[data-cy-chat-button]');
      await page.type('[data-cy-chat-input]', message);
      await page.click('[data-cy-send-message-button]');
      return null;
    },
  };

  on('task', participantFunctions);

  return config;
};
