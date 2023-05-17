const puppeteer = require('puppeteer');

let browser;
let page;

beforeAll(async () => {
  // Launch a new browser instance
  browser = await puppeteer.launch({
    headless: false, // Extension are allowed only in head-full mode
    args: [
      '--disable-extensions-except=.',
      '--load-extension=.',
    ],
  });

  // Create a new page
  page = await browser.newPage();
});

afterAll(async () => {
  // Close the browser after running tests
  await browser.close();
});

test('should load the extension', async () => {
  // Navigate to chrome://extensions and get the body's content
  await page.goto('chrome://extensions/');
  const bodyHandle = await page.$('body');
  const html = await page.evaluate(body => body.innerHTML, bodyHandle);

  // Check that the extension has been loaded
  expect(html).toContain('Your Extension Name');
});
