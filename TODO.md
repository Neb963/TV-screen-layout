# TODO.md — executable plan and evidence ledger

## Current state (2026-10-22)
- Initial GitHub repository was empty. Both uploaded source documents have now been committed **verbatim**; DESIGN.md and this ledger are present alongside a running browser editor.
- Active milestone: M6/M7 export fidelity, portable font and integrated regression QA.
- Implemented: 5 native editable presets, high-density editor shell, precise model/inspector, layers/groups/resize/rotation, guides/snap, image/SVG handling, direct crop, custom identity/font input, project round-trip, lossless PNG redraw.
- **Verified checkpoint:** GitHub Actions [39723457160](https://github.com/Neb963/TV-screen-layout/actions/runs/39723457160), commit `f82e4c4f6`: Node syntax, 10 unit/model checks, Chromium+Firefox browser workflows (24 passed). Actual desktop/mobile screenshots inspected; responsive toggle overlap was repaired.
- **Current unverified additions:** measured preview/PNG color parity and a full embedded-TTF export/reimport test added at `44a43f46b`, pending CI. Some advanced feature/error paths still lack direct browser coverage; tasks remain IN PROGRESS or TODO below.
- Blockers: local shell has no DNS access to github.com (GitHub connector works); browser verification uses real Firefox/Chromium in GitHub Actions. No external hosting is configured.
- No production-complete claim until outstanding tests, fidelity images and negative/recovery paths are checked.

Status values: **TODO**, **IN PROGRESS**, **BLOCKED**, **DONE**. `DONE` requires an execution result, not merely files or build success.

## M0 — repository/design/fidelity proof
- [x] M0.1 DONE Read complete supplied specification and agent instructions; evidence: both files inspected before design.
- [x] M0.2 DONE Verify actual repository baseline; evidence: GitHub get_repo size=0; git/tree request 409 empty repository.
- [x] M0.3 DONE Write specific DESIGN.md and requirement traceability; evidence: initial design commit.
- [ ] M0.4 TODO Prove one renderer can produce identical editor and output composition at HD/4K; acceptance: browser image comparison and exported file inspection.
- [ ] M0.5 DONE Establish CI and inspect real run; acceptance: checks green for a documented commit, not a predicted result.

## M1 — app shell/scene editor
- [ ] M1.1 IN PROGRESS Accessible dense top command bar, sidebars, stage, inspector with responsive collapse; acceptance: desktop/narrow keyboard flows.
- [ ] M1.2 DONE Versioned scene model and validation; acceptance: tests reject malformed/too-large/newer projects without modifying state.
- [ ] M1.3 IN PROGRESS Shared scene renderer with DPR-aware preview and high-resolution redrawing; acceptance: screenshot/export fixture correspondence.
- [ ] M1.4 IN PROGRESS Selection, multi-selection, reverse-order hit testing, object dragging and Escape rollback; acceptance: real browser pointer tests.
- [ ] M1.5 IN PROGRESS Numeric x/y/w/h/angle and resize/rotate handles; acceptance: pixel and properties agree after undo/reimport.

## M2 — precision editing
- [ ] M2.1 IN PROGRESS Reorder and hide/lock layers; acceptance: hit testing respects state, export matches stacking/visibility.
- [ ] M2.2 DONE Group/ungroup, simultaneous move/resize and independent child edit; acceptance: grouped transforms undo atomically.
- [ ] M2.3 IN PROGRESS Align/distribute, grid and canvas-edge snap, guides; acceptance: exact bbox arithmetic and overlays absent from PNG.
- [ ] M2.4 DONE Zoom/pan/fit without document mutations; acceptance: serialized document stable across view changes.
- [ ] M2.5 IN PROGRESS Undo/redo/duplicate/delete/nudge/shortcuts and correct focus behavior; acceptance: browser interaction sequence.

## M3 — media and shapes
- [ ] M3.1 IN PROGRESS PNG/JPEG uploads and clipboard paste; acceptance: image appears, embeds, round-trips and exports.
- [ ] M3.2 DONE Restrictive SVG sanitization with rejection of active/external content; acceptance: malicious fixture rejected; safe SVG paints.
- [ ] M3.3 DONE Placeholder drop/replace, nondestructive image crop/fit/offset; acceptance: frame stays fixed and crop round-trips.
- [ ] M3.4 IN PROGRESS Shapes/images with fill, border, gradient, opacity and shadows; acceptance: preview/PNG compared.
- [ ] M3.5 IN PROGRESS Invalid/corrupt/oversize/missing media handling and safe error states; acceptance: negative tests.

## M4 — typography
- [ ] M4.1 IN PROGRESS Text object and complete editable broadcast text; acceptance: every preset word selectable/editable.
- [ ] M4.2 IN PROGRESS Weight, font size, line height, tracking, alignment, outline and shadow; acceptance: text measurement and PNG parity tests.
- [ ] M4.3 IN PROGRESS Embedded custom font upload/FontFace lifecycle; acceptance: font survives reload/import, exported PNG uses font.
- [ ] M4.4 IN PROGRESS Overflow/wrapping/clipping/empty/long/multiline deterministic behavior; acceptance: documented extreme fixtures.

## M5 — channels and presets
- [ ] M5.1 IN PROGRESS Multiple substantial editable broadcast styles including Fox News–inspired (not copied logo); acceptance: native objects and edit+save.
- [ ] M5.2 IN PROGRESS Lower-thirds/headlines/ticker/LIVE/clock/splits and editable placeholders; acceptance: every object editable and static.
- [ ] M5.3 IN PROGRESS Custom channel naming/palette/logo/font create/apply, preserving existing design until confirmation; acceptance: browser workflow and reload.
- [ ] M5.4 IN PROGRESS Save/reuse/export custom presets; acceptance: instantiate separately, edit without modifying saved source.

## M6 — portability and output
- [ ] M6.1 DONE Download/import versioned editable project including assets/fonts/channel; acceptance: structural equality after export/reimport.
- [ ] M6.2 IN PROGRESS Autosave/recovery, import rollback and storage-quota handling; acceptance: invalid import leaves editor intact.
- [ ] M6.3 DONE HD, 4K, custom PNG, preserve source aspect by default and explain aspect mismatch; acceptance: actual image headers/dimensions verified.
- [ ] M6.4 IN PROGRESS Visually compare representative complex editor/export at 100%, zoomed, DPR>1; acceptance: measured tolerance recorded.
- [ ] M6.5 IN PROGRESS Verify full package portability across clean browser context; acceptance: all original fonts/images present.

## M7 — integrated QA/polish/release
- [ ] M7.1 DONE Run automated tests, syntax checks, CI, docs fresh-checkout instructions; acceptance: captured logs/SHAs.
- [ ] M7.2 IN PROGRESS Firefox real-app full flow test incl paste, grouped transforms, crop, font, export; acceptance: screenshot, actual PNG, imported JSON checks.
- [ ] M7.3 IN PROGRESS Check keyboard/focus/contrast, reduced motion, accessibility and 3 viewports; acceptance: issue list and rerun.
- [ ] M7.4 TODO Stress >100 elements, image memory release, malformed/oversize files, extreme numeric inputs; acceptance: no data loss.
- [ ] M7.5 IN PROGRESS Visual polish and regression retest; acceptance: inspect captures; no dead/placeholder UI.
- [ ] M7.6 TODO Final audit all R01–R16 and reconcile DESIGN/README/TODO; acceptance: truthful final checklist, actual evidence and limitations.

## Verification log
2026-10-22: repository metadata verified empty via GitHub connector. CLI `git ls-remote` was blocked by sandbox DNS (`Could not resolve host: github.com`). Initial docs are design artifacts, *not functionality verification*. Next priority is buildable project bootstrap and executable tests.

2026-10-22: Browser CI 39723068249 validated 16/16 tests; initial Firefox fixture failure traced to bad PNG IDAT CRC, not a decoder defect. CI 39723457160 validated 24/24 browser checks plus 10 unit cases, including new group-resize, drag-crop, gradient editing, safe SVG, and project download/reimport. HD/4K PNG headers and identical export SHA256 values checked. Actual Playwright screenshots extracted from Actions artifacts and inspected at 1550×950 and 430×790. Responsive toolbar controls and physically accurate zoom label refined after visual QA. Current additional parity/font tests are not yet counted as passes.
