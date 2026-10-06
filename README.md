# UI Field Guide

A searchable library of 265 named UI elements with live previews, plus a drag-and-drop mockup builder. It's a single HTML file with no build step and no dependencies to install.

## Run it

Open `index.html` in a browser. To serve it locally instead:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## What's inside

**Library**: 265 elements in 12 groups (actions, inputs, selection, dials and control panels, navigation, layout, data display, feedback, overlays, media, typography and mockup tools). Each element has:

- a live preview
- its other common names ("snackbar", "kebab menu", "CTA"…)
- what it is, when to use it, and what it gets confused with
- related variations
- a short code such as `nav.tabs` or `ctl.thermostat` that you can use to name it exactly in a request

In the library, press **+** on any number of cards (or Shift-click them) to collect them in a tray, then add them all to the builder at once. **Help me choose** asks a few questions, such as what the control does, how many options it has and whether people pick one or several, then suggests matching elements.

**Mockup builder**: drag elements onto a desktop (1280), tablet (834) or mobile (390) frame, then move, resize and relabel them and add notes. It has snap-to-grid, undo/redo and keyboard shortcuts.

- **Palette**: hover an element to preview it, or switch on preview thumbnails. While you drag, the element shows at canvas scale. The **Blocks** tab has ready-made combinations such as headers, button pairs, sign-in and payment forms, KPI rows and landing-page sections. A block is added as a group: dragging moves the whole block, and Alt-drag moves one piece.
- **Layout** adds preset guides, for example header + content, left · center · right, list · detail, dashboard or a column grid. Guides sit behind the elements, and edges snap to them. **Make editable** turns them into Region elements.
- **Toolbar**: the first row holds the mockup name and file actions. The second row is your **Groups** library. The screens strip below it has the screen tabs plus the frame, zoom, grid, layout and view controls.
- **Select several**: drag a box on empty canvas, or Shift-click elements (⌘/Ctrl A selects all). Drag any selected element to move them all. The inspector can align, keep together, duplicate or delete the selection.
- **Groups**: select elements such as a header and its menu, then press **Save selection**. The group appears in the second toolbar row. Click it to add it to the current screen in the same spot, Shift-click to add it to every screen that doesn't have it yet, or drag it into place. When frame sizes differ, full-width pieces stretch and right-aligned pieces keep their margin. Groups are kept per browser (or in the Artifact's shared database) and work in every mockup.
- **Screens**: a mockup can have several screens. Select an element and set **When clicked, go to** to link it to another screen (or back). **Flow map** shows every screen with arrows for each link, and **Play** lets you click through them.
- **Connect** (in the flow map): click an element on any screen, then click the screen it should open. You can also drag from the element straight onto a screen. Drop it on **New screen** to create and link a screen in one step. **Small / Medium / Large** changes the thumbnail size, which makes small elements easier to hit. Esc cancels.
- **Copy for Claude** copies a plain-text description plus JSON. Each element is listed by name and code, with its position, size, layout panel, notes and link. With several screens you can copy all of them together, plus the flow.
- **Save / Save as / Open**: Save overwrites the open mockup, and Save as makes a new copy under a new name. In Open, **Start from** opens a copy of an older mockup so the original stays unchanged. Open can also download a mockup as a `.json` file or load one. Mockups are kept in this browser's local storage. When the page runs as a claude.ai Artifact, they go to the Artifact's shared database instead. Mockups saved before screens existed open as one-screen mockups.

## Project layout

```
index.html   the whole app: styles, element catalogue and builder
README.md
```

Element definitions are in the `E` array inside `index.html`. Each entry looks like this:

```js
{ id: 'nav.tabs', c: 'nav', n: 'Tabs', aka: [...], s: [w, h], t: 'default label',
  d: 'what it is', u: 'when to use it', x: ['often-confused ids'],
  v: 'base element id (variations only)', multi: 1 /* comma-separated items */,
  h: t => `preview HTML` }
```

Previews use the shared `.u` utility classes and the `--w-*` color tokens, so they follow light and dark mode.

## Hosting

Works as-is on GitHub Pages: enable Pages on the repo's default branch and it will serve `index.html`.

The only external requests are Google Fonts. If the fonts can't load, the page falls back to system fonts.
