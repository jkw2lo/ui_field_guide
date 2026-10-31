const { test } = require('@playwright/test');
const { openApp, expect } = require('./helpers');

const names = page => page.evaluate(() => skLeaves().map(n => n.name));

test('sketch a page: split, rename, describe, delete, undo', async ({ page }) => {
  const errors = await openApp(page, 'design');
  await page.evaluate(() => { newProject(); delete M.sketch; setMode('ai'); });
  await expect(page.locator('#skFrame .sk-sec')).toHaveCount(5);
  const first = page.locator('#skFrame .sk-sec').nth(1);
  await first.hover();
  await first.locator('[data-sk="right"]').click();
  expect(await names(page)).toContain('New section');
  await page.locator('#skFrame .sk-sec').nth(1).dblclick();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('Recent brews');
  await page.keyboard.press('Enter');
  await page.fill('#skIntent', 'Show what I brewed lately so I can open one');
  expect(await page.evaluate(() => skLeaves().find(n => n.name === 'Recent brews')?.intent)).toContain('brewed');
  const before = (await names(page)).length;
  await page.keyboard.press('Escape');
  await page.locator('#skFrame .sk-sec').nth(2).click();
  await page.keyboard.press('Delete');
  expect((await names(page)).length).toBe(before - 1);
  await page.keyboard.press('ControlOrMeta+z');
  expect((await names(page)).length).toBe(before);
  expect(errors).toEqual([]);
});

test('drag a gap to resize, and drag a section beside another', async ({ page }) => {
  await openApp(page, 'design');
  await page.evaluate(() => { newProject(); delete M.sketch; setMode('ai'); });
  const sz = () => page.evaluate(() => skOf().kids[1].sz);
  const h0 = await sz();
  const gap = await page.locator('#skFrame .sk-root > .sk-div.col').nth(1).boundingBox();
  await page.mouse.move(gap.x + gap.width / 2, gap.y + gap.height / 2);
  await page.mouse.down();
  await page.mouse.move(gap.x + gap.width / 2, gap.y + 80, { steps: 6 });
  await page.mouse.up();
  expect(await sz()).toBeGreaterThan(h0 + 40);
  // move the last section onto the right edge of the header
  const grip = await page.locator('#skFrame .sk-sec').last().locator('.sk-grip').boundingBox();
  const head = await page.locator('#skFrame .sk-sec').first().boundingBox();
  await page.mouse.move(grip.x + 4, grip.y + 4);
  await page.mouse.down();
  await page.mouse.move(head.x + head.width - 10, head.y + head.height / 2, { steps: 10 });
  await page.mouse.up();
  expect(await page.evaluate(() => skOf().kids[0].kind)).toBe('row');
});

test('start from a structure and hand it to the builder as guides', async ({ page }) => {
  await openApp(page, 'design');
  await page.evaluate(() => { newProject(); M.frame = 'desktop'; delete M.sketch; setMode('ai'); });
  await page.click('[data-sktpl="dash"]');
  expect(await names(page)).toEqual(['Header', 'Summary', 'Main content', 'Side panel', 'History']);
  await page.click('[data-skact="guides"]');
  await expect(page).toHaveURL(/#builder/);
  expect(await page.evaluate(() => M.guides.map(g => g.label))).toEqual(['Header', 'Summary', 'Main content', 'Side panel', 'History']);
});
