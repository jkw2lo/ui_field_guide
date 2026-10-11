# UI Field Guide

A searchable library of 379 named UI elements with live previews, plus a drag-and-drop mockup builder. It's a single HTML file with no build step and no dependencies to install.

## Run it

Open `index.html` in a browser. To serve it locally instead:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## What's inside

**Library**: 379 elements in 14 groups (actions, inputs, selection, dials and control panels, navigation, layout, data display, feedback, overlays, media, AI & chat, commerce, typography and mockup tools). Each element has:

- a live preview
- its other common names ("snackbar", "kebab menu", "CTA"…)
- what it is, when to use it, and what it gets confused with
- related variations
- a short code such as `nav.tabs` or `ctl.thermostat` that you can use to name it exactly in a request

Ratings, reviews and scoring are well covered. There are star, icon and emoji rating inputs, NPS and Likert survey scales, and a feedback prompt. For display there are rating summaries with a star histogram, inline ratings, rating and score badges, category ratings, reviews with photos or a seller reply, review filters, pros and cons, scorecards, leaderboards, scoreboards, level progress and achievement badges.

**AI & chat** covers assistant patterns: prompt box, welcome screen, suggested prompts, conversation, answers with sources and inline citations, response actions, thinking and agent-step indicators, model picker, chat history, attachments, chat + canvas, suggested edits and voice mode. **Commerce** covers buying: product gallery, variant picker, buy box, sale price, delivery info, badges, results bar, filters, bundles, subscriptions, cart items, cart drawer, promo codes, shipping and payment pickers, order confirmation and order tracking.

Many everyday elements also come in more styles: outline, gradient and 3D buttons; filled, underlined and currency fields; split and product-shot heroes; bento and masonry grids; horizontal and overlay cards; stacked area, horizontal, stacked bar, funnel, radar, treemap and Gantt charts; alert tones, toasts with undo and loading dots.

**Preview style** at the top of the library restyles every preview at once: Default, Rounded, Sharp, Brutalist, Glass, Soft UI or Dark, with any accent colour.

In the library, press **+** on any number of cards (or Shift-click them) to collect them in a tray, then add them all to the builder at once. **Help me choose** asks a few questions, such as what the control does, how many options it has and whether people pick one or several, then suggests matching elements.

**Design with AI** (in progress): sketch a page with rough sections instead of picking components. Each section is just a name and, in your own words, what it should do. Start from a structure (header + sections, dashboard, sidebar app, list + detail, landing page, mobile feed, mobile detail) or add your own. You can split sections side by side or top to bottom, merge, duplicate, delete, drag a section beside or onto another, drag the gaps to resize, and double-click to rename. Sketches are saved with the mockup (each page of it has its own), and **Use as layout guides** hands the sections to the builder. Next phases: AI suggests visual options for each section, refines them in conversation, and exports a structured spec for Claude Code.

**Your elements**: add elements the library doesn't have, and keep growing it.

- **+ New element** (in the sidebar, or the Your elements section) asks for a name, a code such as `tea.timer`, a group, other names, what it is, when to use it, a default label and size. For the preview, pick a wireframe (box, button, field, card, list, chips, tabs, slider, switch, chart, image, heading or text) or paste your own HTML; write `{label}` where the label goes. Inline styles and the library's classes work; scripts, style tags and event handlers are removed.
- **Make my own version** on any built-in element's page starts a new element from its look and description.
- **Save to library…** in the builder's inspector turns the selected element into one of yours with its label, size and look. With several selected, **Save to library as one element…** makes a single element that looks like the whole selection.
- Your elements work everywhere the built-in ones do: search, the palette, **Replace with…**, Help me choose, groups, and Copy for Claude, which adds a "Your elements" section describing them so Claude knows what each code means (in **Changes only** too).
- Nothing gets dropped: when a mockup file or an imported page uses a code the library doesn't know, it comes in as a placeholder in Your elements marked **Needs a description**. Open it and press **Describe it**.
- Mockup files and backups carry the definitions of the elements they use, so they open complete in another browser. **Export library** and **Import library** move all your elements at once. They're kept in this browser, or in the Artifact's shared database when it runs as an Artifact.
- Deleting one of your elements turns any placed copies into labelled placeholder boxes.

**Mockup builder**: drag elements onto a desktop (1280), tablet (834) or mobile (390) frame, then move, resize and relabel them and add notes. It has snap-to-grid, undo/redo and keyboard shortcuts.

- **Palette**: hover an element to preview it, or switch on preview thumbnails. While you drag, the element shows at canvas scale. The **Blocks** tab has ready-made combinations such as headers, button pairs, sign-in and payment forms, KPI rows and landing-page sections. A block is added as a group: dragging moves the whole block, and Alt-drag moves one piece.
- **Layout** adds preset guides, for example header + content, left · center · right, list · detail, dashboard or a column grid. Guides sit behind the elements, and edges snap to them. **Make editable** turns them into Region elements.
- **Look**: each mockup has its own visual style and accent colour, set in the screen inspector. The canvas, palette previews, flow map, Play and exported images all follow it, and Copy for Claude describes it.
- **Inspector**: hide or show the right-hand panel with the panel button at the end of the first toolbar row, the × in the panel, or ⌘/Ctrl \. Double-clicking an element brings it back.
- **Toolbar**: the first row holds the mockup name and file actions. The second row is your **Groups** library. The screens strip below it has the screen tabs plus the frame, zoom, grid, layout and view controls.
- **Select several**: drag a box on empty canvas, or Shift-click elements (⌘/Ctrl A selects all). Drag any selected element to move them all. The inspector can align, keep together, duplicate or delete the selection.
- **Groups**: select elements such as a header and its menu, then press **Save selection**. The group appears in the second toolbar row. Click it to add it to the current screen in the same spot, Shift-click to add it to every screen that doesn't have it yet, or drag it into place. When frame sizes differ, full-width pieces stretch and right-aligned pieces keep their margin. Groups are kept per browser (or in the Artifact's shared database) and work in every mockup.
- **Linked groups**: every copy of a group stays linked. Change a label, note, link, size or the position of one piece in any copy, and every other copy in the mockup updates, along with the saved group. Other mockups catch up the next time you open them. Deleting one piece removes it from every copy, while deleting a whole copy removes only that one. **Detach this copy** in the inspector stops one copy from syncing.
- **Copy and paste**: ⌘/Ctrl C, X and V work across screens and mockups. You can also use **Copy to another screen…** in the inspector. Pasting onto a different frame size keeps the layout together and stretches full-width pieces.
- **Snapping**: while you drag or resize, edges and centres snap to other elements, the frame and layout guides, and pink lines show what lined up. Hold ⌘/Ctrl to place freely.
- **Screens**: a mockup can have several screens. Select an element and set **When clicked, go to** to link it to another screen (or back). **Flow map** shows every screen with arrows for each link, and **Play** lets you click through them.
- **Connect** (in the flow map): click an element on any screen, then click the screen it should open. You can also drag from the element straight onto a screen. Drop it on **New screen** to create and link a screen in one step. **Small / Medium / Large** changes the thumbnail size, which makes small elements easier to hit. Esc cancels.
- **Copy for Claude** copies a plain-text description plus JSON. Each element is listed by name and code, with its position, size, layout panel, notes and link. With several screens you can copy all of them together, plus the flow.
- **Import a web page** (Open → Import a web page): drag the **Send to UI Field Guide** bookmark to your bookmarks bar. Then click it on any page you're working on, including localhost and pages you're signed in to. It reads the visible layout in your own browser (nothing is uploaded), recognises headers, sidebars, navigation, buttons and button groups, fields, tables, charts, images, cards and text, and opens it here as an editable screen at real positions. If the new tab is blocked, the layout is also on your clipboard to paste.
- **Changes only**: an imported screen remembers the original. Edit it freely: **Replace with…** swaps an element for another while keeping its place, size and label, and you can move, delete, add, relabel and add notes. Copy for Claude's **Changes only** then lists just the replacements, removals, moves, text changes, additions, notes and links, and asks for everything else to stay as it is. The screen inspector counts the changes and can restore removed elements and show the original outlines; each element can be restored to its original.
- **Download**:
  - PNG images (2×) of the current screen, all screens on one sheet, or the flow map.
  - The mockup as a `.json` file, including the groups it uses.
  - A **full backup** of every saved mockup, all your groups and the open mockup. Restore it from Open → Open a file if browser storage is ever cleared.
- **Save / Save as / Open**: Save overwrites the open mockup, and Save as makes a new copy under a new name. In Open, **Start from** opens a copy of an older mockup so the original stays unchanged. Open can also load a mockup file or a backup. Mockups are kept in this browser's local storage. When the page runs as a claude.ai Artifact, they go to the Artifact's shared database instead. Mockups saved before screens existed open as one-screen mockups.

## Project layout

```
index.html          markup and styles
js/catalogue.js     icons, groups (CATS) and every element (E) with its preview
js/library.js       shared helpers, your own elements, mode switching, the library, Help me choose
js/builder.js       the mockup builder: screens, layouts, blocks, palette, canvas, inspector,
                    flow map, Play, groups, copy and paste, export, images and saving
js/design.js        Design with AI: the rough canvas of intent sections
js/importer.js      importing a web page and the "Changes only" export
js/boot.js          start-up (loaded last)
tests/              Playwright smoke tests and a sample app page for the importer
```

There is still no build step. The scripts are plain `<script>` tags loaded in order and share one global scope, so files only define things and wire events; `boot.js` draws the app once everything has loaded. Styles stay inline in `index.html` because image export copies them into the exported picture, which also has to work when the file is opened from disk.

Element definitions are in the `E` array in `js/catalogue.js`. Each entry looks like this:

```js
{ id: 'nav.tabs', c: 'nav', n: 'Tabs', aka: [...], s: [w, h], t: 'default label',
  d: 'what it is', u: 'when to use it', x: ['often-confused ids'],
  v: 'base element id (variations only)', multi: 1 /* comma-separated items */,
  h: t => `preview HTML` }
```

Previews use the shared `.u` utility classes and the `--w-*` color tokens, so they follow light and dark mode and the visual styles.

## Tests

```bash
npm install
npx playwright install chromium
npm test
```

The tests serve the repo with `python3 -m http.server` and drive the app in Chromium: the library, builder, Design with AI, page import (including the bookmarklet's new-tab handoff on `tests/fixtures/sample-app.html`), downloads and backups. GitHub Actions runs them on every pull request.

## Hosting

Works as-is on GitHub Pages: enable Pages on the repo's default branch and it will serve `index.html`.

The only external requests are Google Fonts. If the fonts can't load, the page falls back to system fonts.
