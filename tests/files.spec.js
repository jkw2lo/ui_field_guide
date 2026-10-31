const { test } = require('@playwright/test');
const fs = require('fs');
const { openApp, expect } = require('./helpers');

test('download a PNG of the screen', async ({ page }) => {
  await openApp(page, 'builder');
  await page.evaluate(() => { loadProject(EXAMPLE); setFlow(false); });
  await page.click('#dlBtn');
  const [file] = await Promise.all([page.waitForEvent('download'), page.click('[data-img="screen"]')]);
  expect(file.suggestedFilename()).toMatch(/\.(png|svg)$/);
  const bytes = fs.readFileSync(await file.path());
  expect(bytes.length).toBeGreaterThan(5_000);
});

test('a full backup survives cleared storage', async ({ page }) => {
  await openApp(page, 'builder');
  await page.evaluate(() => { loadProject(EXAMPLE); setFlow(false); });
  await page.click('#saveBtn');
  await page.fill('#svName', 'Recipes');
  await page.click('#svGo');
  await page.click('#dlBtn');
  const [file] = await Promise.all([page.waitForEvent('download'), page.click('[data-dl="backup"]')]);
  const path = await file.path();
  expect(JSON.parse(fs.readFileSync(path, 'utf8')).kind).toBe('backup');
  // wipe everything, then restore from the file
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => booted);
  await page.click('#openBtn');
  await expect(page.locator('#savedList .row2')).toHaveCount(0);
  await page.setInputFiles('#opFile', path);
  await page.click('#rsOpen');
  expect(await page.evaluate(() => [P.name, P.screens.length, localSaved().length])).toEqual(['Recipes', 3, 1]);
});

test('the visual style follows the mockup into the canvas, Play and the export', async ({ page }) => {
  await openApp(page, 'builder');
  await page.evaluate(() => { loadProject(EXAMPLE); setFlow(false); clearSel(); drawInsp(); });
  await page.click('#bSty [data-sty="dark"]');
  await page.click('#bSty [data-acc="#D6409F"]');
  await expect(page.locator('#frame')).toHaveClass(/sty-dark/);
  await page.click('#exportBtn');
  expect(await page.inputValue('#expTxt')).toContain('Visual style: Dark');
});
