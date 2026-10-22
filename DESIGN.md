# DESIGN.md — Television News Screen Layout Designer

Status: **approved implementation direction; feature verification remains tracked in TODO.md**. Source authority: CLIENT_SPEC.md then AGENTS.md. This design does not declare untested capabilities complete.

## Product and workflows
A desktop-first, local-first, browser graphics instrument for broadcast designers, journalists and art directors producing **static** HD/4K television-news mockups. Start from a native editable broadcast composition, edit objects/branding, import images/fonts, save a portable editable project, and export a full-resolution PNG. No video, animation, feeds or broadcast output.

## Decisions and alternatives
**Chosen:** dependency-light HTML/CSS/JavaScript, a canonical JSON scene, Canvas 2D as **the same drawing function** for viewport and high-resolution export, plus an HTML overlay for transform handles. Assets embedded as data URLs, fonts loaded through the FontFace API and stored as binary data URLs. No external server.
- SVG DOM editor plus SVG serialization offers easy hit testing but SVG-as-image font loading is inconsistent and often omits embedded custom fonts. Rejected for the baseline.
- Fabric/Konva could accelerate transforms but add dependency/repository costs and do not themselves guarantee text/export equality. Not chosen for an initially empty project.
- Export by screenshot or CSS scaling is prohibited: render the complete scene again at exact target pixels using the shared Canvas draw pipeline.
- Tradeoff: all exported pixels are rasterized PNG, but at native output resolution, not an upscaled preview. Text/vector edges are re-rendered at target resolution.

## Requirements-to-acceptance matrix
| ID | Source requirement | Implementation surface | Observable acceptance |
|---|---|---|---|
| R01 | Many editable presets; Fox News–style | presets.js, preset browser | Multiple distinctly styled native-element compositions; switch, edit objects, save |
| R02 | Custom channels, logo/font/palette | channel manager + document metadata | Create/apply brand; logo, palette and font survive project round-trip |
| R03 | Lower thirds/headlines/tickers/LIVE/clocks/splits | native scene factories | Select and edit every element; clocks/tickers remain static |
| R04 | Drag/position/resize/rotate/duplicate/crop | scene interactions/inspector | Pointer and numeric transforms persist; replaceable media crop is nondestructive |
| R05 | Numeric x/y/w/h/angle/spacing | properties inspector | Exact document-unit input affects object/export and undo/redo |
| R06 | Layers/groups/locks/z-order/alignment/snaps/guides | hierarchy tools, scene commands | Group/multi operations, reorder, lock, align and guides behave predictably |
| R07 | Zoom/pan/undo/redo | viewport and history store | Pure view controls do not mutate document; transactional edit history |
| R08 | Clipboard and PNG/JPEG/SVG upload | asset pipeline | Images embedded and editable after import/reopen; invalid inputs rejected |
| R09 | Placeholder replacement and crop/position | image element fit and crop fields | Existing frame remains; media moves/clips inside it |
| R10 | Logos/shapes/fills/borders/gradients/shadows/opacity | graphics inspector/render | Native shapes/images reflect effects in editor and PNG |
| R11 | All text editable | text inspector, canvas typography | Labels, badge, clock and tickers all editable and persistent |
| R12 | Custom fonts/weight/size/line-height/tracking/align/outline/shadow | FontFace registry/typography inspector | Text styles and embedded fonts survive save/import/export |
| R13 | Editable project export/import | versioned JSON serializer | Save/load with full scene, media, fonts, channel and geometry |
| R14 | User presets | local preset catalog/export | Save/reapply editable composition |
| R15 | HD, 4K and custom-size PNG | renderer/export panel | Exact pixel sizes, aspect behavior explicit, preview/export parity |
| R16 | Robustness/accessibility | validation/error handling and QA | Keyboard flows, corrupt import protection, responsive panels, visible focus |

## Information architecture / UX
Top command bar: project title, new/open/save, undo/redo, preset chooser, export action. Left sidebar: presets/channels and layers hierarchy; right inspector: object transform, type-specific styling and image/text properties. Center: large checkerboard stage, zoom/pan, guides/snap overlays, marquee/handle feedback. Status: physical scene dimensions, selected objects and zoom. Compact dense visual hierarchy, not a card dashboard. Dialogs for project export, channel management, and asset/font import as needed.
A new document opens with a vivid, editable broadcast preset rather than a blank placeholder.

## Interaction specification
Scene coordinates are floating-point source pixels, e.g. 1920×1080. Selection is by reverse z-order hit test; Shift toggles multiple IDs; empty click clears. Drag begins a transaction snapshot, Escape cancels, pointer-up commits **one** undo step. Object rotation about its center. Eight resize handles; proportional scaling via Shift when supported; dimensions clamped positive. An explicit crop inspector uses normalized source image window [0,1] and cover/contain controls; imported media replaces a selected placeholder/image without modifying frame geometry. Grouping gives members a shared groupId; a group selection moves/transforms members together but children retain their individual, editable coordinates. Hidden/locked items neither render/hit-test (hidden) nor accept mutations (locked). Layer list is canonical z-order; bring forward/back updates that list. Align/distribute operate on bounding boxes; drag snapping against canvas center/edges and 10px grid, optionally disabled by Alt; guides never render in output. Keyboard: Delete, Ctrl/Cmd+D, Ctrl/Cmd+Z/Shift+Z, Ctrl/Cmd+C/V for scene elements, arrows nudge (Shift 10x), Space+drag pan; ignore global shortcuts when focus is in inputs. Zoom and pan stay in viewport state and are never serialized in the document.

## Document format (v1)
JSON object: {format:"tv-screen-layout", version:1, title, width, height, background, channel, elements, assets, fonts}. Elements are ordered back-to-front, each with stable id, type ('rect'|'ellipse'|'text'|'image'|'placeholder'), x/y/w/h/rotation/opacity, groupId, locked, hidden, style; texts include text/fontFamily/fontSize/fontWeight/lineHeight/letterSpacing/textAlign/stroke/shadow; image elements store assetId, crop {x,y,w,h} normalized and fit; shapes store fill (solid or linear gradient), border width/color and shadow. Assets map to MIME-checked **embedded** data URLs; fonts map to base64 data URL, family and metadata. No external URLs in persisted v1. Imported docs are validated; unknown or future versions rejected with recoverable error, no partial state changes. Deterministic JSON serialization of the canonical state. Reusable presets are full scene snapshots with IDs regenerated on instantiation.

## Rendering and export contract
One `drawScene(ctx,scene,assets,options)` function draws both editor and export. The editor sets transform for viewport+CSS pixel ratio; PNG export creates an offscreen canvas exactly (target width,target height), scales by output/source dimensions, invokes identical draw, then toBlob('image/png'). No DOM overlays/guides are on the exported surface. Rotation: translate object center, rotate radians, draw local primitive centered. Image crop: drawImage using fractional source window into clipped local object frame. Deterministic text: measureText wrapping at word boundaries with char fallback for long tokens; lineHeight in source units; explicit baselines and line breaks. Text opacity/shadow/stroke/gradients handled in same paint path. Export maintains aspect by default; non-matching custom dimensions require an explicit 'stretch' or contain-fit choice and visual explanation. Loading fonts and decoding images precede render/export; errors must block exports rather than silently render missing assets. Browser Canvas font consistency and color management remain empirical risks requiring Firefox/Chromium visual parity runs.

## Visual system
Base: near-black #10151f app shell, #182130 panel, #253247 separator; light text #ebf0f7, secondary #a5b4c7; accent #60a5fa, warning #fbbf24, danger #f87171. Type system: system UI 12–13px controls, 14px section labels, 16px project title. Space tokens 4/8/12/16px, input height 30px, 1px borders, radius 6px; narrow editing inspector 285–320px, sidebar 250–280px. Selected art: clear blue selection boundary, corner/edge handles outside exports. Visible :focus-visible rings and reduced-motion mode. The stage receives maximum central area. On smaller screens, sidebars become collapsible tabs and the stage remains operable with touch and pointer gestures.

## Architecture / performance
- `src/model.js`: scene defaults, validation, cloning, edit transactions, project serialization, geometry.
- `src/presets.js`: broadcast component builders and distinct presets.
- `src/renderer.js`: single Canvas 2D renderer and text layout used by all output paths.
- `src/assets.js`: robust file ingestion, SVG sanitization, decoding, embedded fonts.
- `src/app.js`: application orchestration, editor events, panels, history, commands.
- `src/styles.css` and `index.html`: accessible application shell.
- `tests/*.test.mjs`: node-based domain tests; browser acceptance via Playwright/Firefox where available.
Retain a lightweight front-end: no framework, no build step necessary; tests run with built-in Node test runner. Continuous integration validates JS syntax/model tests and browser behavior if installed. Avoid full redraw on every pointer event beyond requestAnimationFrame; memoize decoded image assets and release stale resources.

## Persistence and recovery
Download JSON as .tvnews.json, import by file picker; autosave last working document in localStorage only when size permits; quota errors are visible and must not replace the in-memory document. Prompt before replacing dirty work, and keep import transactional. Embedded images/fonts make project portable. User preset/channel catalogs stored locally and separately; optional catalog backup through project metadata. Newer schema versions fail closed with a clear error.

## Verification strategy
Tests: pure model invariants, version/oversized input failures, scene transform history; browser end-to-end editing, keyboard, media import, crop, preset/channel, save/reload, export dimensions. Pixel-level PNG parity under controlled DPR/zoom and known fixtures, tolerance ≤1 px for critical edges with explicit notes on antialiasing. Test 1920×1080, 3840×2160, custom aspect, long text, empty scene, stacked images, rotated gradient shapes, transparent assets, custom fonts; visual inspection at desktop 1440×900, compact 1024×768, narrow/mobile. No done claims without executed evidence.

## Known risks/open verification
1. Embedded font availability in Canvas export: await font load before capture and test after import.
2. Browser security: prohibit scriptable SVG and cross-origin URLs; reject unsupported content rather than sanitize only by blacklisting.
3. Memory: 4K Canvas plus decoded images can trigger resource limits; catch errors and keep project intact.
4. Main/browser renderer may differ slightly due platform font rasterization: test per browser and document deltas.
5. Complex grouping with nested affine matrices is unnecessary for first iteration; flat groupId movement plus independent element rotations is predictable. A full nested-scene hierarchy would be a deliberate later migration if required.
