const puppeteer = require('puppeteer');

const URL = 'http://localhost:3000';

(async () => {
  const browser = await puppeteer.launch({ headless: false, args: ['--use-fake-ui-for-media-stream'] });
  const page = await browser.newPage();
  await page.goto(URL);

  const nameSel = '#input-user-name';
  const roomSel = '#input-room-name';
  const btnSel = '.MuiButton-label';

  await page.waitForSelector(nameSel);
  await page.waitForSelector(roomSel);
  await page.waitForSelector(btnSel);

  await page.type(nameSel, 'Webmoti');
  await page.type(roomSel, 'Room 1');
  await page.click(btnSel);

  const btn2Sel = '.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary';
  await page.waitForSelector(btn2Sel);

  await page.waitForFunction(
    selector => !document.querySelector(selector).classList.contains('Mui-disabled'),
    {},
    btn2Sel
  );

  await page.click(btn2Sel);

  const btn3Sel = '#root > div > main > footer > div > div.MuiGrid-root.MuiGrid-item > div > button:nth-child(1)';
  await page.waitForSelector(btn3Sel);

  const isMicrophoneUnmuted = await page.evaluate(selector => {
    const button = document.querySelector(selector);
    return button && !button.classList.contains('muted-class'); 
  }, btn3Sel);

  if (isMicrophoneUnmuted) {
    await page.click(btn3Sel);
  }
})();
