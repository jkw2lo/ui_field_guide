const { expect } = require('@playwright/test');

// Open the app in a mode with empty storage, and collect page errors so every test can assert there were none.
// Font loading needs the network; its failures aren't app errors.
async function openApp(page, mode = 'library') {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => {
    if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)|net::ERR|Failed to load resource|CORS policy/.test(m.text())) errors.push(m.text());
  });
  await page.goto('/#' + mode);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => typeof booted !== 'undefined' && booted);
  return errors;
}

// A fresh, empty desktop mockup in the builder
async function blankMockup(page, frame = 'desktop') {
  await page.evaluate(f => { setMode('builder'); newProject(); M.frame = f; drawAll(); }, frame);
}

const count = (page, sel) => page.locator(sel).count();

module.exports = { openApp, blankMockup, count, expect };
