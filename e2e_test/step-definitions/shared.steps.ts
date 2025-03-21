import { Before, Given, After } from '@cucumber/cucumber';
import { chromium, Browser, Page, BrowserContext } from 'playwright';

export let page: Page;
export let context: BrowserContext;
let browser: Browser;

Given('I login', async function () {
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext({ recordVideo: { dir: 'videos/' } });

  page = await context.newPage();
  await page.goto('https://example.com');
});


After(async function () {
  await context.close();
});
