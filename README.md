# Framecraft — Broadcast Layout Studio

A local-first web application for creating **static, editable television news-screen compositions**. Not a video player, animation editor, live feed, or broadcasting platform.

## Run locally
Prerequisites: a modern browser, Python 3 or another static HTTP server, Node 22+ for tests.

```sh
python3 -m http.server 4173
# open http://localhost:4173/
```

No backend or installation is needed to edit. All artwork stays in the browser. Download a **.tvnews.json** file to preserve a portable, fully editable version; exporting PNG is separate. Browser autosave is best-effort and limited by local storage quota, so export important work to disk.

## Test
```sh
npm install
npm test
npx playwright install chromium firefox
npm run test:e2e
```
The browser suite starts its own Python HTTP server using Playwright's webServer configuration. CI runs Node tests and real Chromium/Firefox workflows.

## Main workflows
Choose one of eight editable news-screen presets in the left sidebar; a Fox-inspired breaking-news layout is included without external brand logos. Click objects in the canvas or use **Layers** to select them; drag to move, use the eight handles to resize and the circle above a selected object to rotate. The right inspector offers exact geometry and typography. Shift-click to multi-select, then align/group; layer rows can be hidden/locked/reordered.

Add text, rectangles, ellipses, image regions, or PNG/JPEG/SVG images. Select an image/placeholder then **Fill/Replace image** to preserve its frame. Crop percentages define a non-destructive source window; `Cover`, `Contain` and `Stretch` control fitting. Import custom .woff/.woff2/.ttf/.otf fonts from a selected text layer. The **Channels** tab controls title, palette, font and embedded logo; save identities and reusable editable presets locally.

Shortcuts outside text inputs: Ctrl/Cmd+Z / Ctrl/Cmd+Shift+Z undo/redo; Ctrl/Cmd+D duplicate; Ctrl/Cmd+C/V copy/paste selected art; Ctrl/Cmd+G group; Ctrl/Cmd+Shift+G ungroup; arrows nudge (Shift = 10px); Delete removes; Space+drag pan; wheel pan; Ctrl+wheel zoom; Alt while dragging disables snapping; Escape cancels drag. For image paste, copy a bitmap from another application and paste onto the canvas.

**Export PNG** defaults to source aspect ratio and supports HD, Full HD, 4K, and custom pixel dimensions. Non-proportional sizing prompts for confirmation and stretches the artwork. All output comes from the same Canvas renderer as the editor, without guides or selection outlines. Save/editable project and image export are separate commands.

## Source of truth
`CLIENT_SPEC.md` → `AGENTS.md` → `DESIGN.md` → `TODO.md`. TODO is the live verification ledger and explicitly identifies work that has not passed empirical tests.

## Security and limitations
Images and fonts are embedded in projects; SVG imports accept only a restrictive whitelist (no scripts, event handlers, external resources, or foreignObject). There is no server upload or external source resolution. Custom fonts rely on each browser's Canvas FontFace implementation; browser parity must be validated before classifying export as faithful. Very large 4K/100MP exports can hit GPU/browser memory limits; failures must leave the project intact.
