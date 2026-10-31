const { test } = require('@playwright/test');
const { openApp, expect } = require('./helpers');

// The bookmarklet's code, as the app generates it (pointing back at this server)
async function bookmarkletCode(page) {
  await openApp(page, 'builder');
  return page.evaluate(() => decodeURIComponent(bookmarkletHref().slice('javascript:'.length)));
}

test('the bookmarklet is valid JavaScript', async ({ page }) => {
  const code = await bookmarkletCode(page);
  expect(() => new Function(code)).not.toThrow();
  expect(code.length).toBeLessThan(60_000);
});

test('capture recognises the parts of a real page', async ({ page }) => {
  await openApp(page, 'builder');
  const src = await page.evaluate(() => uifgCapture.toString());
  await page.goto('/tests/fixtures/sample-app.html');
  const cap = await page.evaluate(s => eval('(' + s + ')')('x'), src);
  const types = cap.els.map(e => e.type);
  for (const t of ['nav.topbar', 'nav.sidebar', 'txt.heading', 'act.group', 'in.search', 'in.text', 'sel.select', 'sel.checkbox', 'sel.radio', 'data.line', 'lay.card', 'data.table', 'lay.footer']) {
    expect(types, `expected ${t}`).toContain(t);
  }
  const by = t => cap.els.find(e => e.type === t);
  expect(by('nav.sidebar').t).toContain('History');
  expect(by('sel.radio').t).toBe('Light, Medium, Strong');
  expect(cap.els.find(e => e.type === 'in.text' && e.t === 'Email')).toBeTruthy();
  expect(by('act.group').t).toBe('Day, Week, Month');
  expect(cap.frame).toBe('desktop');
});

test('clicking the bookmark opens the Field Guide in a new tab with the page ready to import', async ({ page, context }) => {
  const code = await bookmarkletCode(page);
  await page.goto('/tests/fixtures/sample-app.html');
  const [guide] = await Promise.all([context.waitForEvent('page'), page.evaluate(code)]);
  await guide.waitForLoadState();
  await expect(guide.locator('.mhead h3')).toHaveText('Import a web page');
  await expect(guide.locator('.mbody')).toContainText('Brewlog');
  await guide.click('#capNew');
  const s = await guide.evaluate(() => ({ name: P.name, n: M.els.length, base: !!M.base, url: M.base.url }));
  expect(s.name).toBe('Brewlog · Dashboard');
  expect(s.n).toBeGreaterThan(10);
  expect(s.base).toBe(true);
  expect(s.url).toContain('sample-app.html');
});

test('after editing an imported page, Copy for Claude lists only the changes', async ({ page }) => {
  await openApp(page, 'builder');
  const src = await page.evaluate(() => uifgCapture.toString());
  await page.goto('/tests/fixtures/sample-app.html');
  const cap = await page.evaluate(s => eval('(' + s + ')')('x'), src);
  await page.goto('/#builder');
  await page.waitForFunction(() => booted);
  await page.evaluate(c => receiveCapture(c), cap);
  await page.click('#capNew');
  // replace the chart through the dialog
  await page.evaluate(() => setSel([M.els.find(e => e.type === 'data.line').uid]));
  await page.click('#iRep');
  await page.fill('#rpQ', 'bar chart');
  await page.click('[data-rp="data.bar"]');
  // remove the footer, retitle the page, add a toast
  await page.evaluate(() => { setSel([M.els.find(e => e.type === 'lay.footer').uid]); del(); });
  await page.evaluate(() => setSel([M.els.find(e => e.type === 'txt.heading').uid]));
  await page.fill('#iT', 'Brew log');
  await page.evaluate(() => addEl('fb.toast'));
  // a duplicate is new, not the original moved
  await page.evaluate(() => { setSel([M.els.find(e => e.type === 'data.table').uid]); dup(); });
  await page.click('#exportBtn');
  await expect(page.locator('#expScope [data-s="changes"]')).toHaveAttribute('aria-pressed', 'true');
  const text = await page.inputValue('#expTxt');
  expect(text).toContain('Replace:\n- Line chart [data.line]');
  expect(text).toContain('→ Bar chart [data.bar]');
  expect(text).toContain('Remove:\n- Footer [lay.footer]');
  expect(text).toContain('Change text:\n- Heading [txt.heading]');
  expect(text).toContain('Add:\n- Toast [fb.toast]');
  expect(text).toContain('Table [data.table]'); // the duplicate shows up as added
  expect(text).not.toContain('Move or resize');
});

test('a capture can be pasted when the new tab is blocked', async ({ page }) => {
  await openApp(page, 'builder');
  const cap = { app: 'ui-field-guide', kind: 'capture', v: 1, url: 'https://example.com/', title: 'Example', frame: 'mobile', at: Date.now(), els: [{ type: 'nav.appbar', x: 0, y: 0, w: 390, h: 56, t: 'Inbox' }, { type: 'nope.unknown', x: 0, y: 60, w: 100, h: 40 }] };
  await page.click('#openBtn');
  await page.click('#opWeb');
  await page.click('#capPaste');
  await page.fill('#capTxt', JSON.stringify(cap));
  await page.click('#capGo');
  await page.click('#capNew');
  expect(await page.evaluate(() => [M.frame, M.els.length > 0, !!M.base])).toEqual(['mobile', true, true]);
});
