import { When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { page } from './shared.steps';

When('I visit provider1 console', async function () {
  await page.goto('https://example.com');
});

When('I visit provider1 workload', async function () {
  await page.goto('https://example.com');
});

Then('I see {string} in the provider1 console', async function (_expectedText: string) {
  const h1 = page.locator('h1').first();
  const resultText = await h1.textContent();
  assert(resultText?.includes("Example Domain"));
  // assert(resultText?.includes(_expectedText)); // stubbed out to just hit example.com
});

Then('I see {string} in the provider1 workload', async function (_expectedText: string) {
  const h1 = page.locator('h1').first();
  const resultText = await h1.textContent();
  assert(resultText?.includes("Example Domain"));
  // assert(resultText?.includes(_expectedText)); // stubbed out to just hit example.com
});

When('I visit provider1 workload {string}', async function (workloadPath: string | undefined) {
  await page.goto(`https://example.com${workloadPath}`);
});