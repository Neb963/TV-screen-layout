# TODO.md — executable plan and evidence ledger

## Current state (2026-10-22)
- Authority: full, exact uploaded CLIENT_SPEC.md and AGENTS.md retained on main; DESIGN.md maps all 16 product requirements. Initial repository was empty.
- Active milestone: M7 integrated QA / fidelity refinement and release evidence.
- Implemented: eight distinct, native-element editorial compositions; Canvas 2D common preview+export renderer; direct selection/resize/rotation/multi-group transforms; rotated-bounds alignment, guides/snapping, layers, locks, z-order, image/SVG/JPEG imports, clipboard, nondestructive crop, styling, embedded fonts, custom brands, portable projects, custom presets and HD/4K/custom PNG.
- **Last fully verified checkpoint:** [CI 39726581692](https://github.com/Neb963/TV-screen-layout/actions/runs/39726581692), commit `2786df7bb`: Node syntax + model tests and **56/56** Chromium/Firefox end-to-end browser tests, including exact PNG dimensions, pixel samples, font round-trip, group resize, custom aspect, shadow scaling, delayed uploads, autosave and recovery.
- **Post-checkpoint changes not yet verified:** expanded 8-preset catalog; visible-bounds alignment/snapping; harmonized native-scene and image clipboard; unique font-family replacement; SVG/JPEG/quota/parallel-file-reads regression tests; independent-font-context test; screenshot evidence from all eight presets. The next successful CI run must cover all.
- Outstanding: inspect newly captured preset PNGs; verify real OS bitmap paste manually (automated synthetic-event coverage is not the OS clipboard); keyboard accessibility and touch/browser zoom audit; memory-pressure tests; exact pixel-edge differences across browser/zoom; comprehensive final review of all R01–R16.
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
- [ ] M1.3 IN PROGRESS Shared scene renderer with DPR-aware preview and high-resolution redrawing; acceptance: screenshot/export fixture correspondence.
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
- [ ] M4.1 IN PROGRESS Text object and complete editable broadcast text; acceptance: every preset word selectable/editable.
- [ ] M4.2 IN PROGRESS Weight, font size, line height, tracking, alignment, outline and shadow; acceptance: text measurement and PNG parity tests.
- [ ] M4.3 IN PROGRESS Embedded custom font upload/FontFace lifecycle; acceptance: font survives reload/import, exported PNG uses font.
- [ ] M4.4 IN PROGRESS Overflow/wrapping/clipping/empty/long/multiline deterministic behavior; acceptance: documented extreme fixtures.

## M5 — channels and presets
- [ ] M5.1 IN PROGRESS Multiple substantial editable broadcast styles including Fox News–inspired (not copied logo); acceptance: native objects and edit+save.
- [ ] M5.2 IN PROGRESS Lower-thirds/headlines/ticker/LIVE/clock/splits and editable placeholders; acceptance: every object editable and static.
- [ ] M5.3 DONE Custom channel naming/palette/logo/font create/apply, preserving existing design until confirmation; acceptance: browser workflow and reload.
- [ ] M5.4 DONE Save/reuse/export custom presets; acceptance: instantiate separately, edit without modifying saved source.

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
- [ ] M7.4 IN PROGRESS Stress >100 elements, image memory release, malformed/oversize files, extreme numeric inputs; acceptance: no data loss.
- [ ] M7.5 IN PROGRESS Visual polish and regression retest; acceptance: inspect captures; no dead/placeholder UI.
- [ ] M7.6 TODO Final audit all R01–R16 and reconcile DESIGN/README/TODO; acceptance: truthful final checklist, actual evidence and limitations.

## Verification log
2026-10-22: repository metadata verified empty via GitHub connector. CLI `git ls-remote` was blocked by sandbox DNS (`Could not resolve host: github.com`). Initial docs are design artifacts, *not functionality verification*. Next priority is buildable project bootstrap and executable tests.

2026-10-22: Browser CI 39723068249 validated 16/16 tests; initial Firefox fixture failure traced to bad PNG IDAT CRC, not a decoder defect. CI 39723457160 validated 24/24 browser checks plus 10 unit cases, including new group-resize, drag-crop, gradient editing, safe SVG, and project download/reimport. HD/4K PNG headers and identical export SHA256 values checked. Actual Playwright screenshots extracted from Actions artifacts and inspected at 1550×950 and 430×790. Responsive toolbar controls and physically accurate zoom label refined after visual QA. Current additional parity/font tests are not yet counted as passes.

2026-10-22 continuation: CI 39724803153 verified 43/44 browser flows; uncovered Firefox synthetic clipboard event incompatibility. Corrected event fixture and native paste-item fallback; CI 39725863725 passed 44/44 tests. CI 39726185552 passed 48/48 after shadow scaling and in-flight import fencing; CI 39726396182 passed 54/56 and detected an out-of-range opacity display-state bug. Fixed inspector normalization; CI 39726581692 passed all 56 browser checks. Since then, extended 8-preset catalog, model rotated-bounds alignment/snapping, secure family-specific FontFace handling, race-safe project opens, bitmap-vs-native object paste precedence and negative tests. Those newer changes remain unverified pending active CI. Test evidence includes real downloaded HD/4K PNG dimensions, matching repeat-export checksums, sampled renderer color parity and image captures; exact cross-resolution glyph antialiasing may differ and remains under fidelity review.
