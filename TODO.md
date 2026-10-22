# TODO.md — executable plan and evidence ledger

## Current state (2026-10-22)
- Authority: full, exact uploaded CLIENT_SPEC.md and AGENTS.md retained on main; DESIGN.md maps all 16 product requirements. Initial repository was empty.
- Active milestone: M7 integrated QA / fidelity refinement and release evidence.
- Implemented: eight distinct, native-element editorial compositions; Canvas 2D common preview+export renderer; direct selection/resize/rotation/multi-group transforms; rotated-bounds alignment, guides/snapping, layers, locks, z-order, image/SVG/JPEG imports, clipboard, nondestructive crop, styling, embedded fonts, custom brands, portable projects, custom presets and HD/4K/custom PNG.
- **Latest verified checkpoint:** [CI 39728266570](https://github.com/Neb963/TV-screen-layout/actions/runs/39728266570), commit `c46d275a`: **13/13 Node tests, 68/68 Chromium/Firefox browser tests, syntax checks and CI success**. Coverage includes 8 preset exports, HD/4K/custom PNG, sample-level preview parity, typography, file import, font in a clean browser context, live edits, state recovery, and negative media/security cases.
- **Newly verified in 39728266570:** eight native-element presets, rotated-bounds alignment tests, pasted image/native element precedence, isolated custom-font project reimport, SVG/JPEG import and PNG export, corrupted-image and project rejection, localStorage quota resilience, parallel open request fencing, 120-element edit+export, and exported screenshot evidence. All eight composition PNGs were inspected; election/weather clipping was fixed and rechecked.
- Outstanding: **real OS bitmap paste** on desktop (tests use synthetic clipboard events), full keyboard/screen-reader and touch-device acceptance, memory-pressure/resource limit profiling, exhaustive complex-scene pixel-diff at arbitrary DPR and zoom, and final external/operator acceptance. These remain unverified, not failed.
- Environmental note: local git CLI cannot resolve github.com; repository work and real Chromium/Firefox verification use GitHub connector + Actions. No production hosting configured.
- No application-wide production-ready declaration until remaining checks and documentation reconciliation are complete.

Status values: **TODO**, **IN PROGRESS**, **BLOCKED**, **DONE**. `DONE` requires an execution result, not merely files or build success.

## M0 — repository/design/fidelity proof
- [x] M0.1 DONE Read complete supplied specification and agent instructions; evidence: both files inspected before design.
- [x] M0.2 DONE Verify actual repository baseline; evidence: GitHub get_repo size=0; git/tree request 409 empty repository.
- [x] M0.3 DONE Write specific DESIGN.md and requirement traceability; evidence: initial design commit.
- [ ] M0.4 IN PROGRESS Prove one renderer can produce identical editor and output composition at HD/4K; acceptance: browser image comparison and exported file inspection.
- [ ] M0.5 DONE Establish CI and inspect real run; acceptance: checks green for a documented commit, not a predicted result.

## M1 — app shell/scene editor
- [ ] M1.1 IN PROGRESS Accessible dense top command bar, sidebars, stage, inspector with responsive collapse; acceptance: desktop/narrow keyboard flows.
- [ ] M1.2 DONE Versioned scene model and validation; acceptance: tests reject malformed/too-large/newer projects without modifying state.
- [ ] M1.3 DONE Shared scene renderer with DPR-aware preview and high-resolution redrawing; acceptance: screenshot/export fixture correspondence.
- [ ] M1.4 DONE Selection, multi-selection, reverse-order hit testing, object dragging and Escape rollback; acceptance: real browser pointer tests.
- [ ] M1.5 DONE Numeric x/y/w/h/angle and resize/rotate handles; acceptance: pixel and properties agree after undo/reimport.

## M2 — precision editing
- [ ] M2.1 DONE Reorder and hide/lock layers; acceptance: hit testing respects state, export matches stacking/visibility.
- [ ] M2.2 DONE Group/ungroup, simultaneous move/resize and independent child edit; acceptance: grouped transforms undo atomically.
- [ ] M2.3 IN PROGRESS Align/distribute, grid and canvas-edge snap, guides; acceptance: exact bbox arithmetic and overlays absent from PNG.
- [ ] M2.4 DONE Zoom/pan/fit without document mutations; acceptance: serialized document stable across view changes.
- [ ] M2.5 IN PROGRESS Undo/redo/duplicate/delete/nudge/shortcuts and correct focus behavior; acceptance: browser interaction sequence.

## M3 — media and shapes
- [ ] M3.1 IN PROGRESS PNG/JPEG uploads and clipboard paste; acceptance: image appears, embeds, round-trips and exports.
- [ ] M3.2 DONE Restrictive SVG sanitization with rejection of active/external content; acceptance: malicious fixture rejected; safe SVG paints.
- [ ] M3.3 DONE Placeholder drop/replace, nondestructive image crop/fit/offset; acceptance: frame stays fixed and crop round-trips.
- [ ] M3.4 DONE Shapes/images with fill, border, gradient, opacity and shadows; acceptance: preview/PNG compared.
- [ ] M3.5 IN PROGRESS Invalid/corrupt/oversize/missing media handling and safe error states; acceptance: negative tests.

## M4 — typography
- [ ] M4.1 DONE Text object and complete editable broadcast text; acceptance: every preset word selectable/editable.
- [ ] M4.2 IN PROGRESS Weight, font size, line height, tracking, alignment, outline and shadow; acceptance: text measurement and PNG parity tests.
- [ ] M4.3 DONE Embedded custom font upload/FontFace lifecycle; acceptance: font survives reload/import, exported PNG uses font.
- [ ] M4.4 IN PROGRESS Overflow/wrapping/clipping/empty/long/multiline deterministic behavior; acceptance: documented extreme fixtures.

## M5 — channels and presets
- [ ] M5.1 DONE Multiple substantial editable broadcast styles including Fox News–inspired (not copied logo); acceptance: native objects and edit+save.
- [ ] M5.2 DONE Lower-thirds/headlines/ticker/LIVE/clock/splits and editable placeholders; acceptance: every object editable and static.
- [ ] M5.3 DONE Custom channel naming/palette/logo/font create/apply, preserving existing design until confirmation; acceptance: browser workflow and reload.
- [ ] M5.4 DONE Save/reuse/export custom presets; acceptance: instantiate separately, edit without modifying saved source.

## M6 — portability and output
- [ ] M6.1 DONE Download/import versioned editable project including assets/fonts/channel; acceptance: structural equality after export/reimport.
- [ ] M6.2 DONE Autosave/recovery, import rollback and storage-quota handling; acceptance: invalid import leaves editor intact.
- [ ] M6.3 DONE HD, 4K, custom PNG, preserve source aspect by default and explain aspect mismatch; acceptance: actual image headers/dimensions verified.
- [ ] M6.4 IN PROGRESS Visually compare representative complex editor/export at 100%, zoomed, DPR>1; acceptance: measured tolerance recorded.
- [ ] M6.5 IN PROGRESS Verify full package portability across clean browser context; acceptance: all original fonts/images present.

## M7 — integrated QA/polish/release
- [ ] M7.1 DONE Run automated tests, syntax checks, CI, docs fresh-checkout instructions; acceptance: captured logs/SHAs.
- [ ] M7.2 IN PROGRESS Firefox real-app full flow test incl paste, grouped transforms, crop, font, export; acceptance: screenshot, actual PNG, imported JSON checks.
- [ ] M7.3 IN PROGRESS Check keyboard/focus/contrast, reduced motion, accessibility and 3 viewports; acceptance: issue list and rerun.
- [ ] M7.4 IN PROGRESS Stress >100 elements, image memory release, malformed/oversize files, extreme numeric inputs; acceptance: no data loss.
- [ ] M7.5 IN PROGRESS Visual polish and regression retest; acceptance: inspect captures; no dead/placeholder UI.
- [ ] M7.6 TODO Final audit all R01–R16 and reconcile DESIGN/README/TODO; acceptance: truthful final checklist, actual evidence and limitations.

## Verification log
2026-10-22: repository metadata verified empty via GitHub connector. CLI `git ls-remote` was blocked by sandbox DNS (`Could not resolve host: github.com`). Initial docs are design artifacts, *not functionality verification*. Next priority is buildable project bootstrap and executable tests.

2026-10-22: Browser CI 39723068249 validated 16/16 tests; initial Firefox fixture failure traced to bad PNG IDAT CRC, not a decoder defect. CI 39723457160 validated 24/24 browser checks plus 10 unit cases, including new group-resize, drag-crop, gradient editing, safe SVG, and project download/reimport. HD/4K PNG headers and identical export SHA256 values checked. Actual Playwright screenshots extracted from Actions artifacts and inspected at 1550×950 and 430×790. Responsive toolbar controls and physically accurate zoom label refined after visual QA. Current additional parity/font tests are not yet counted as passes.

2026-10-22 continuation: CI 39724803153 verified 43/44 browser flows; uncovered Firefox synthetic clipboard event incompatibility. Corrected event fixture and native paste-item fallback; CI 39725863725 passed 44/44 tests. CI 39726185552 passed 48/48 after shadow scaling and in-flight import fencing; CI 39726396182 passed 54/56 and detected an out-of-range opacity display-state bug. Fixed inspector normalization; CI 39726581692 passed all 56 browser checks. Since then, extended 8-preset catalog, model rotated-bounds alignment/snapping, secure family-specific FontFace handling, race-safe project opens, bitmap-vs-native object paste precedence and negative tests. Those newer changes remain unverified pending active CI. Test evidence includes real downloaded HD/4K PNG dimensions, matching repeat-export checksums, sampled renderer color parity and image captures; exact cross-resolution glyph antialiasing may differ and remains under fidelity review.

2026-10-22 final QA checkpoint: [Actions 39728266570](https://github.com/Neb963/TV-screen-layout/actions/runs/39728266570), HEAD `c46d275a28a7c0f421bd74b89fff2484c8527eef` — syntax checks, **13 model tests**, **68 Chromium+Firefox end-to-end tests**, green. Earlier run 39727693588 passed 64 browser tests but failed 4 (2 duplicated failures across browsers): election/weather text clipping and missing error notification when malformed SVG was loaded from a project. Both issues corrected in `a709e7c5e` and `79b122015` and retested green. The verified browser evidence includes 8 exported 1920×1080 preset PNGs for each browser, a separate real 3840×2160 PNG, view/export sampled pixel parity, and identical download hashes on repeat/round-trip. Reviewed all eight layouts as a gallery and reinspected full-size election/weather PNGs after the fixes. Additional typed validation rejects malformed gradients, fields, styles and channel identity resources before rendering.

## Requirement verification audit (reference DESIGN.md R01–R16)

| Requirement | Automated / visual evidence | Remaining qualification |
|---|---|---|
| R01 editable presets | VERIFIED — 8 native layouts, model tests, 16 exported PNG captures | Operator aesthetic approval |
| R02 channels/identity | VERIFIED — brand/font/logo applied, saved and reloaded | More diverse custom fonts/manual UX |
| R03 static broadcast elements | VERIFIED — native headlines, lower thirds, ticker, LIVE, clock, split panels | Visual content is mock data by design |
| R04 manipulation/crop | VERIFIED — browser drag, resize/rotate, group scale, crop, duplicate | Touch gesture acceptance |
| R05 numeric precision | VERIFIED — inspector geometry/typography, invalid opacity clamped | Rotated corner / guides manual fine-precision UX |
| R06 layer controls | VERIFIED — order, lock/hide, grouping and rotated-bound alignment | Direct drag snapping experience manually |
| R07 view/history | VERIFIED — zoom/pan invariance, undo/redo, cancellation | Large history stress |
| R08 media | VERIFIED for PNG/JPEG/SVG and synthetic paste in both browsers | **Real OS clipboard paste pending** |
| R09 replaceable crop frames | VERIFIED — replace, crop pan/zoom/fit and project round-trip | Extreme image aspect ratios |
| R10 vector/appearance | VERIFIED — rectangles/ellipses, gradients, opacity, shadows and 4K scaling | Broader pixel-diff combinations |
| R11 text editing | VERIFIED — editable native static text and project export/import | Non-Latin glyph stress |
| R12 typography/fonts | VERIFIED — controls, custom TTF embedded and exact export hash in isolated context | Further user-supplied font families and visual QA |
| R13 portable editable projects | VERIFIED — JSON validation, round-trip, embedded media/fonts, corrupt import rejection | Forward-version migration when v2 exists |
| R14 reusable user presets | VERIFIED — save, instantiate and re-edit independent scene | Browser-local storage is not cloud sync |
| R15 PNG dimensions and fidelity | VERIFIED — HD, 4K, custom/stretch confirmation, repeated hashes, sampled parity, visual PNG inspection | **Exhaustive pixel-edge parity not complete** |
| R16 reliability and accessibility | PARTIAL — error paths, 120 elements, quota, responsive screenshot, keyboard tests | **Assistive technology, real touch and memory pressure** |
