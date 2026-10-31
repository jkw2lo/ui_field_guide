const { test } = require('@playwright/test');
const { openApp, blankMockup, expect } = require('./helpers');

const els = page => page.evaluate(() => M.els.map(e => ({ uid: e.uid, type: e.type, x: e.x, y: e.y, w: e.w, h: e.h, t: e.t, g: e.g })));

test('add from the palette, drag to move, undo', async ({ page }) => {
  const errors = await openApp(page, 'builder');
  await blankMockup(page);
  await page.click('#plist .pi[data-id="act.button"]');
  await expect(page.locator('#frame .el')).toHaveCount(1);
  const [a] = await els(page);
  const box = await page.locator('#frame .el').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 80, { steps: 8 });
  await page.mouse.up();
  const [b] = await els(page);
  expect(b.x).toBeGreaterThan(a.x + 100);
  expect(b.y).toBeGreaterThan(a.y + 60);
  expect(b.x % 8).toBe(0); // snapped to the 8px grid
  await page.click('#undoBtn');
  const [c] = await els(page);
  expect([c.x, c.y]).toEqual([a.x, a.y]);
  expect(errors).toEqual([]);
});

test('drag a box to select several, then save them as a linked group used on two screens', async ({ page }) => {
  await openApp(page, 'builder');
  await blankMockup(page);
  await page.evaluate(() => { addEl('nav.topbar', 0, 0); addEl('in.search', 400, 100); clearSel(); drawCanvas(); });
  const frame = await page.locator('#frame').boundingBox();
  await page.mouse.move(frame.x - 10, frame.y - 10);
  await page.mouse.down();
  await page.mouse.move(frame.x + frame.width * .6, frame.y + frame.height * .25, { steps: 6 });
  await page.mouse.up();
  await expect(page.locator('#insp h6')).toHaveText('2 elements');
  await page.click('#gSave');
  await page.fill('#gName', 'Header');
  await page.click('#gGo');
  await expect(page.locator('.gchip')).toHaveCount(1);
  await page.click('#addScr');
  await page.click('.gchip');
  expect(await page.evaluate(() => M.els.length)).toBe(2);
  // editing one copy updates the other screen's copy
  await page.evaluate(() => { const e = M.els.find(x => x.type === 'nav.topbar'); setSel([e.uid]); });
  await page.fill('#iT', 'Brewlog');
  const labels = await page.evaluate(() => P.screens.map(s => s.els.find(e => e.type === 'nav.topbar').t));
  expect(labels).toEqual(['Brewlog', 'Brewlog']);
});

test('blocks are added as one group that moves together', async ({ page }) => {
  await openApp(page, 'builder');
  await blankMockup(page);
  await page.click('#pTabs [data-t="blocks"]');
  await page.click('#plist .pi[data-block="frm.signin"]');
  const list = await els(page);
  expect(list.length).toBeGreaterThan(5);
  expect(new Set(list.map(e => e.g)).size).toBe(1);
});

test('copy on one screen, paste on another', async ({ page }) => {
  await openApp(page, 'builder');
  await blankMockup(page);
  await page.evaluate(() => { addEl('lay.card', 40, 40); addEl('lay.card', 320, 40); });
  await page.locator('#area').click({ position: { x: 5, y: 5 } }); // focus the canvas, not a text field
  await page.evaluate(() => setSel(M.els.map(e => e.uid)));
  await page.keyboard.press('ControlOrMeta+c');
  await page.click('#addScr'); // a new screen focuses its name field…
  await page.locator('#area').click({ position: { x: 5, y: 5 } }); // …so leave it before pasting
  await page.keyboard.press('ControlOrMeta+v');
  expect(await page.evaluate(() => M.els.map(e => e.type))).toEqual(['lay.card', 'lay.card']);
});

test('save, change, save as, and start from an older mockup', async ({ page }) => {
  await openApp(page, 'builder');
  await blankMockup(page);
  await page.evaluate(() => addEl('act.button'));
  await page.click('#saveBtn');
  await page.fill('#svName', 'Version one');
  await page.click('#svGo');
  await expect(page.locator('#dirty')).toHaveText('Saved');
  await page.evaluate(() => addEl('in.text'));
  await expect(page.locator('#dirty')).toHaveText('Unsaved changes');
  await page.click('#saveAsBtn');
  await page.fill('#svName', 'Version two');
  await page.click('#svGo');
  await page.click('#openBtn');
  await expect(page.locator('#savedList .row2')).toHaveCount(2);
  await page.click('#savedList .row2:has-text("Version one") [data-from]');
  expect(await page.evaluate(() => [P.id, P.name, M.els.length])).toEqual([null, 'Version one copy', 1]);
});

test('the example links its screens: flow map arrows and Play navigation', async ({ page }) => {
  await openApp(page, 'builder');
  await page.evaluate(() => { loadProject(EXAMPLE); setFlow(false); });
  await page.click('#viewSeg [data-v="flow"]');
  expect(await page.locator('#fa path').count()).toBeGreaterThan(3);
  await page.click('#playBtn');
  await page.click('.pe.hot >> nth=0');
  expect(await page.evaluate(() => document.getElementById('ovl').dataset.sid)).toBe('detail');
  await page.click('[data-pback]');
  expect(await page.evaluate(() => document.getElementById('ovl').dataset.sid)).toBe('home');
});

test('Copy for Claude describes every screen and the flow, with valid JSON', async ({ page }) => {
  await openApp(page, 'builder');
  await page.evaluate(() => { loadProject(EXAMPLE); setFlow(false); });
  await page.click('#exportBtn');
  const text = await page.inputValue('#expTxt');
  expect(text).toContain('FLOW');
  expect(text).toContain('[lay.card]');
  JSON.parse(text.split('\nJSON:\n')[1]);
});

test('layout guides, hiding the inspector, and the draft surviving a reload', async ({ page }) => {
  await openApp(page, 'builder');
  await blankMockup(page);
  await page.click('#layBtn');
  await page.click('[data-lay="hlcr"]');
  expect(await page.locator('#frame .guide').count()).toBe(4);
  await page.click('#inspBtn');
  await expect(page.locator('.bld')).toHaveClass(/noinsp/);
  await page.evaluate(() => addEl('data.table'));
  await page.waitForTimeout(400); // the draft saves shortly after a change
  await page.reload();
  await page.waitForFunction(() => booted);
  expect(await page.evaluate(() => [M.guides.length, M.els.length, inspOn])).toEqual([4, 1, false]);
});
