const { test } = require('@playwright/test');
const { openApp, expect } = require('./helpers');

test('every element renders, and the library lists them all', async ({ page }) => {
  const errors = await openApp(page);
  const result = await page.evaluate(() => {
    const broken = [];
    for (const e of E) { try { render(e.id); } catch (x) { broken.push(`${e.id}: ${x.message}`); } }
    return { total: E.length, broken, cards: document.querySelectorAll('#secs .card').length, label: $('#countLbl').textContent };
  });
  expect(result.broken).toEqual([]);
  expect(result.total).toBeGreaterThan(350);
  expect(result.cards).toBe(result.total);
  expect(result.label).toContain(String(result.total));
  expect(errors).toEqual([]);
});

test('every Help me choose result and block piece is a real element', async ({ page }) => {
  await openApp(page);
  const missing = await page.evaluate(() => {
    const ids = []; const walk = n => { if (!n) return; (n.a || []).forEach(a => { if (Array.isArray(a.res)) ids.push(...a.res); walk(a.next); }); if (Array.isArray(n.res)) ids.push(...n.res); walk(n.next); };
    walk(WZ); OPTS.forEach(o => ids.push(o[0]));
    for (const b of BLOCKS) for (const frame of ['desktop', 'mobile']) {
      if (b.only && b.only !== (frame === 'mobile' ? 'mob' : 'wide')) continue;
      blockItems(b, { frame, els: [] }).items.forEach(i => ids.push(i[0]));
    }
    return [...new Set(ids)].filter(id => !EM[id]);
  });
  expect(missing).toEqual([]);
});

test('search finds elements by their nicknames', async ({ page }) => {
  await openApp(page);
  await page.fill('#q', 'snackbar');
  await expect(page.locator('#secs .card[data-id="fb.toast"]')).toBeVisible();
  await page.fill('#q', 'kebab');
  await expect(page.locator('#secs .card').first()).toBeVisible();
});

test('pick several cards, then add them all to the builder', async ({ page }) => {
  await openApp(page);
  for (const id of ['act.button', 'in.text', 'nav.tabs']) await page.click(`[data-pick="${id}"]`);
  await expect(page.locator('#tray')).toContainText('3 picked');
  const before = await page.evaluate(() => M.els.length);
  await page.click('[data-addall]');
  await expect(page).toHaveURL(/#builder/);
  expect(await page.evaluate(() => M.els.length)).toBe(before + 3);
});

test('Help me choose suggests controls for a number of options', async ({ page }) => {
  await openApp(page);
  await page.click('#helpLib');
  await page.click('.wzopt:has-text("Choose from options")');
  await page.click('.wzopt:has-text("5")');
  await page.click('.wzopt:has-text("Just one")');
  await expect(page.locator('.wzr b:has-text("Dropdown")').first()).toBeVisible();
});

test('the preview style restyles every preview', async ({ page }) => {
  await openApp(page);
  await page.click('#libSty [data-sty="brutal"]');
  expect(await page.locator('#secs .spec.sty-brutal').count()).toBeGreaterThan(300);
  await page.reload();
  await page.waitForFunction(() => booted);
  expect(await page.locator('#secs .spec.sty-brutal').count()).toBeGreaterThan(300); // remembered
});

test('your own element joins the library and the builder', async ({ page }) => {
  await openApp(page);
  await page.click('#newEl');
  await page.fill('#ceN', 'Brew timer card');
  await page.fill('#ceD', 'Shows the steep time counting down.');
  await page.click('#ceGo');
  const id = await page.evaluate(() => custom[0]?.id);
  expect(id).toBeTruthy();
  await page.fill('#q', 'brew timer');
  await expect(page.locator(`#secs .card[data-id="${id}"]`)).toBeVisible();
  await page.evaluate(i => { setMode('builder'); addEl(i); }, id);
  expect(await page.evaluate(i => M.els.some(e => e.type === i), id)).toBe(true);
});

test('opens straight from disk, with no server', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '..', 'index.html'));
  await page.waitForFunction(() => typeof booted !== 'undefined' && booted);
  expect(await page.locator('#secs .card').count()).toBeGreaterThan(350);
  expect(errors).toEqual([]);
});
