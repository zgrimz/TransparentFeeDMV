const puppeteer = require('puppeteer');
const path = require('path');
const { setup: setupDevServer, teardown: teardownDevServer } = require('jest-dev-server');


let browser;
let page;
let servers;

beforeAll(async () => {

  servers = await setupDevServer({
    command: 'http-server',
    launchTimeout: 50000
  });

  // Resolve the relative path to your extension
  const extensionPath = path.join(__dirname, '.');

  // Launch a new browser instance
  browser = await puppeteer.launch({
    headless: false, // Extension are allowed only in head-full mode
    dumpio: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  // Create a new page
  page = await browser.newPage();
});

afterAll(async () => {
  // Close the browser after running tests
  await browser.close();
  await teardownDevServer(servers);
});

test('Validate that iframe not present on site not in data set', async () => {
  await page.goto('http://127.0.0.1:8080');
  
  await new Promise((r) => setTimeout(r, 2000));

  const frame = page.frames().find(frame => frame.name() === 'feeAlert');

  //expect frame to be undefined
  expect(frame).toBeUndefined();
}, 30000);

test('Validate that iframe appears on site with fee', async () => {
  await page.goto('https://allsoulsbar.com');

  await new Promise((r) => setTimeout(r, 2000));

  const frame = page.frames().find(frame => frame.name() === 'feeAlert');

  expect(frame).not.toBeUndefined();
}, 30000);
