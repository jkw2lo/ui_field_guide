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

**Mockup builder**: drag elements onto a desktop (1280), tablet (834) or mobile (390) frame, then move, resize and relabel them and add notes. It has snap-to-grid, undo/redo and keyboard shortcuts.

- **Copy for Claude** copies a plain-text description plus JSON of the mockup. It lists every element by name and code, with its position, size and notes, so you can paste it into an AI chat or a spec.
- **Save** keeps mockups in this browser's local storage. When the page runs as a claude.ai Artifact, Save writes to the Artifact's shared database instead.

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
