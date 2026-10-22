# TODO.md — executable plan and evidence ledger

## Current state (2026-10-22)
- Repository was empty at initial inspection (no files, commits, tests, or existing app).
- Authority read: supplied CLIENT_SPEC.md (entire file) and AGENTS.md (entire file).
- Active milestone: M0 design / repository bootstrap.
- Completed: architecture selected; requirements-to-acceptance map drafted in DESIGN.md.
- Outstanding: every implemented behavior and empirical acceptance test; **no application feature is yet verified**.
- Blockers: local sandbox cannot resolve github.com for git CLI; GitHub connector supports repository writes. Browser testing must be established separately.
- No claim of production completeness or export fidelity until browser runs and image evidence exist.

Status values: **TODO**, **IN PROGRESS**, **BLOCKED**, **DONE**. `DONE` requires an execution result, not merely files or build success.

## M0 — repository/design/fidelity proof
- [x] M0.1 DONE Read complete supplied specification and agent instructions; evidence: both files inspected before design.
- [x] M0.2 DONE Verify actual repository baseline; evidence: GitHub get_repo size=0; git/tree request 409 empty repository.
- [x] M0.3 DONE Write specific DESIGN.md and requirement traceability; evidence: initial design commit.
- [ ] M0.4 TODO Prove one renderer can produce identical editor and output composition at HD/4K; acceptance: browser image comparison and exported file inspection.
- [ ] M0.5 TODO Establish CI and inspect real run; acceptance: checks green for a documented commit, not a predicted result.

## M1 — app shell/scene editor
- [ ] M1.1 TODO Accessible dense top command bar, sidebars, stage, inspector with responsive collapse; acceptance: desktop/narrow keyboard flows.
- [ ] M1.2 TODO Versioned scene model and validation; acceptance: tests reject malformed/too-large/newer projects without modifying state.
- [ ] M1.3 TODO Shared scene renderer with DPR-aware preview and high-resolution redrawing; acceptance: screenshot/export fixture correspondence.
- [ ] M1.4 TODO Selection, multi-selection, reverse-order hit testing, object dragging and Escape rollback; acceptance: real browser pointer tests.
- [ ] M1.5 TODO Numeric x/y/w/h/angle and resize/rotate handles; acceptance: pixel and properties agree after undo/reimport.

## M2 — precision editing
- [ ] M2.1 TODO Reorder and hide/lock layers; acceptance: hit testing respects state, export matches stacking/visibility.
- [ ] M2.2 TODO Group/ungroup, simultaneous move/resize and independent child edit; acceptance: grouped transforms undo atomically.
- [ ] M2.3 TODO Align/distribute, grid and canvas-edge snap, guides; acceptance: exact bbox arithmetic and overlays absent from PNG.
- [ ] M2.4 TODO Zoom/pan/fit without document mutations; acceptance: serialized document stable across view changes.
- [ ] M2.5 TODO Undo/redo/duplicate/delete/nudge/shortcuts and correct focus behavior; acceptance: browser interaction sequence.

## M3 — media and shapes
- [ ] M3.1 TODO PNG/JPEG uploads and clipboard paste; acceptance: image appears, embeds, round-trips and exports.
- [ ] M3.2 TODO Restrictive SVG sanitization with rejection of active/external content; acceptance: malicious fixture rejected; safe SVG paints.
- [ ] M3.3 TODO Placeholder drop/replace, nondestructive image crop/fit/offset; acceptance: frame stays fixed and crop round-trips.
- [ ] M3.4 TODO Shapes/images with fill, border, gradient, opacity and shadows; acceptance: preview/PNG compared.
- [ ] M3.5 TODO Invalid/corrupt/oversize/missing media handling and safe error states; acceptance: negative tests.

## M4 — typography
- [ ] M4.1 TODO Text object and complete editable broadcast text; acceptance: every preset word selectable/editable.
- [ ] M4.2 TODO Weight, font size, line height, tracking, alignment, outline and shadow; acceptance: text measurement and PNG parity tests.
- [ ] M4.3 TODO Embedded custom font upload/FontFace lifecycle; acceptance: font survives reload/import, exported PNG uses font.
- [ ] M4.4 TODO Overflow/wrapping/clipping/empty/long/multiline deterministic behavior; acceptance: documented extreme fixtures.

## M5 — channels and presets
- [ ] M5.1 TODO Multiple substantial editable broadcast styles including Fox News–inspired (not copied logo); acceptance: native objects and edit+save.
- [ ] M5.2 TODO Lower-thirds/headlines/ticker/LIVE/clock/splits and editable placeholders; acceptance: every object editable and static.
- [ ] M5.3 TODO Custom channel naming/palette/logo/font create/apply, preserving existing design until confirmation; acceptance: browser workflow and reload.
- [ ] M5.4 TODO Save/reuse/export custom presets; acceptance: instantiate separately, edit without modifying saved source.

## M6 — portability and output
- [ ] M6.1 TODO Download/import versioned editable project including assets/fonts/channel; acceptance: structural equality after export/reimport.
- [ ] M6.2 TODO Autosave/recovery, import rollback and storage-quota handling; acceptance: invalid import leaves editor intact.
- [ ] M6.3 TODO HD, 4K, custom PNG, preserve source aspect by default and explain aspect mismatch; acceptance: actual image headers/dimensions verified.
- [ ] M6.4 TODO Visually compare representative complex editor/export at 100%, zoomed, DPR>1; acceptance: measured tolerance recorded.
- [ ] M6.5 TODO Verify full package portability across clean browser context; acceptance: all original fonts/images present.

## M7 — integrated QA/polish/release
- [ ] M7.1 TODO Run automated tests, syntax checks, CI, docs fresh-checkout instructions; acceptance: captured logs/SHAs.
- [ ] M7.2 TODO Firefox real-app full flow test incl paste, grouped transforms, crop, font, export; acceptance: screenshot, actual PNG, imported JSON checks.
- [ ] M7.3 TODO Check keyboard/focus/contrast, reduced motion, accessibility and 3 viewports; acceptance: issue list and rerun.
- [ ] M7.4 TODO Stress >100 elements, image memory release, malformed/oversize files, extreme numeric inputs; acceptance: no data loss.
- [ ] M7.5 TODO Visual polish and regression retest; acceptance: inspect captures; no dead/placeholder UI.
- [ ] M7.6 TODO Final audit all R01–R16 and reconcile DESIGN/README/TODO; acceptance: truthful final checklist, actual evidence and limitations.

## Verification log
2026-10-22: repository metadata verified empty via GitHub connector. CLI `git ls-remote` was blocked by sandbox DNS (`Could not resolve host: github.com`). Initial docs are design artifacts, *not functionality verification*. Next priority is buildable project bootstrap and executable tests.
