const { test } = require('@playwright/test');
const { openApp, blankMockup, expect } = require('./helpers');

test('a save that the browser refuses is reported, not silently lost', async ({ page }) => {
  await openApp(page, 'builder');
  await blankMockup(page);
  await page.evaluate(() => addEl('act.button'));
  // the browser now refuses every write, as it does when storage is full
  await page.evaluate(() => { Storage.prototype.setItem = function () { throw new DOMException('Quota exceeded', 'QuotaExceededError'); }; });
  await page.click('#saveBtn');
  await page.fill('#svName', 'Too big');
  await page.click('#svGo');
  await expect(page.locator('.toast')).toContainText('storage is full');
  await expect(page.locator('#storeBar')).toBeVisible();
  await expect(page.locator('#storeBar')).toHaveClass(/urgent/);
  await expect(page.locator('#storeBar')).toContainText('aren’t being saved');
  await expect(page.locator('#dirty')).not.toHaveText('Saved');
});

test('nearly full storage warns, and saved mockups prompt a first backup', async ({ page }) => {
  await openApp(page, 'builder');
  // 4 MB of other data
  await page.evaluate(() => localStorage.setItem('filler', 'x'.repeat(4_000_000)));
  await page.reload();
  await page.waitForFunction(() => booted);
  await expect(page.locator('#storeBar')).toContainText('getting full');
  await page.click('#storeBar [data-sb="later"]');
  await expect(page.locator('#storeBar')).toBeHidden();
  // a saved mockup and no backup yet: a gentle reminder
  await page.evaluate(() => localStorage.removeItem('filler'));
  await blankMockup(page);
  await page.click('#saveBtn');
  await page.fill('#svName', 'Mine');
  await page.click('#svGo');
  await expect(page.locator('#storeBar')).toContainText('haven’t backed them up yet');
  const [file] = await Promise.all([page.waitForEvent('download'), page.click('#storeBar [data-sb="backup"]')]);
  expect(file.suggestedFilename()).toMatch(/^ui-field-guide-backup-.*\.json$/);
  await expect(page.locator('#storeBar')).toBeHidden();
});

test('on a phone, file actions fold into one menu and nothing scrolls sideways', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await openApp(page, 'builder');
  await expect(page.locator('#newBtn')).toBeHidden();
  expect(await page.locator('#exportBtn').innerText()).toBe('Copy'); // the long label is hidden on phones
  await page.click('#fileBtn');
  await page.click('[data-fm="openBtn"]');
  await expect(page.locator('.mhead h3')).toHaveText('Open a mockup');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
