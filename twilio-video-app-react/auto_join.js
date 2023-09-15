const puppeteer = require('puppeteer');
const { exec } = require('child_process');

function getURL() {
  // run the view app command to get the app url
  return new Promise(resolve => {
    exec('twilio rtc:apps:video:view', (error, stdout, stderr) => {
      if (error || stderr) {
        console.error(error || stderr);
        process.exit(1);
      }

      // extract url from output
      const match = stdout.match(/Web App URL: (.+)/);
      if (match && match[1]) {
        return resolve(match[1]);
      } else {
        console.error('There is no deployed app');
        process.exit(1);
      }
    });
  });
}

(async () => {
  const URL = await getURL();

  // non headless to show browser
  // --use-fake-ui-for-media-stream will skip the use camera/mic prompt
  const browser = await puppeteer.launch({ headless: false, args: ['--use-fake-ui-for-media-stream'] });
  const page = await browser.newPage();
  await page.goto(URL);

  const nameSel = '#input-user-name';
  const roomSel = '#input-room-name';
  const btnSel = '.MuiButton-label';

  // wait until loaded
  await page.waitForSelector(nameSel);
  await page.waitForSelector(roomSel);
  await page.waitForSelector(btnSel);

  // enter name and room, click continue
  await page.type(nameSel, 'Webmoti');
  await page.type(roomSel, 'Room 1');
  await page.click(btnSel);

  // ui changes here and join button appears
  const btn2Sel = '.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary';
  await page.waitForSelector(btn2Sel);

  // wait until join button is enabled
  await page.waitForFunction(
    selector => !document.querySelector(selector).classList.contains('Mui-disabled'),
    {},
    btn2Sel
  );
  // join meeting
  await page.click(btn2Sel);
})();
