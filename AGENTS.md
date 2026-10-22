# AGENTS.md — Television News Screen Layout Designer

## Mission and binding authority
Build a **professional web app for ultra-high-fidelity STATIC television news screen mockups**, not a video editor or broadcast system. Success is working user functionality, precision, reliable native editable scene files, and measured preview/PNG export fidelity — not documentation quantity.

Order of precedence: (1) CLIENT_SPEC.md (2) AGENTS.md (3) DESIGN.md (4) TODO.md (5) implementation conventions. Read CLIENT_SPEC.md completely and inspect the repository before feature work or resuming. Do not silently narrow the specification.

## Mandatory workflow
1. Inspect repository/app/CI, established architecture, assets and actual tests. Identify reusable code. Map all requirements to observable workflows/acceptance criteria.
2. Create/maintain DESIGN.md and actionable TODO.md **before** new app feature implementation. DESIGN.md must address product/workflows/exclusions, complete requirements matrix, editor information architecture, interactions, visual tokens, presets/channel identities, scene schema/transforms, shared rendering/export, portable persistence, technical architecture, accessibility/responsiveness, full verification plan and risks/tradeoffs. Reflect the *actual* product; distinguish decisions, working features and proposals.
3. Implement the next dependency-ready vertical slice. Include error/empty/recovery states. Run tests against the real app and inspect screenshots/output. Fix observed faults, update TODO.md **immediately** with evidence and actual status. Update DESIGN.md when decisions change.
4. Repeat until all client requirements are implemented and empirically accepted, or an exact external blocker remains. Never label untested, skipped, failing or partially working behavior DONE. Commit meaningful tested batches regularly. Preserve concurrent changes and avoid force pushes.
5. Full QA at end: end-to-end editing, presets, channels, media, typography, save/reopen, export, visual delta, accessibility, responsive behavior, performance, reliability and README fresh checkout.

## Requirements that cannot be compromised
- Multiple credible, fully editable news layouts, including Fox-inspired graphics without copying external intellectual property; native layers, editable headlines/lower thirds/static ticker/LIVE/clock/split-panel elements; reusable brands (logo/typography/palette) and presets.
- Direct drag/resize/rotate/crop/duplicate. Inspector numeric x/y/w/h/rotation/spacing; multiselect, layers, grouping, locks, z-order, snapping/guides, alignment, zoom/pan and undo/redo. View zoom/pan MUST NOT mutate document coordinates or export.
- Clipboard/upload PNG/JPEG/SVG, designated replacement frames and nondestructive crop. Embed assets, disallow executable SVG/external media, and handle malformed, oversized and missing assets safely. Vector shapes, gradient, fill, outline, shadow and opacity.
- Every textual element editable. Font selection/embedded user fonts, weight/size/leading/tracking/align/outline/shadow; deterministic wrap/clipping/baselines across editor/export and round trips.
- Versioned fully editable portable project file retaining document, assets, fonts, layers and branding. Custom presets editable, never flattened. High-resolution PNG at HD, 4K and custom sizes; clear aspect behavior. Explicit errors for invalid output.
- Preview and export render from the same canonical scene with consistent transform composition, clipping, crop, font metrics and resolution. Never use an upscaled screenshot for export. Overlay handles/guides/UI never appear in output. Verify actual pixels/PNG dimensions.
- Well-structured, dense professional editor, not a generic dashboard. Accessible focus, labels, predictable shortcuts (inactive inside form fields), keyboard navigation, sensible tablet/mobile panel collapse and reduced-motion support.
- Preserve work on failures. Validate project imports transactionally, confirm destructive actions, avoid leaky resources and fragile global mutation, keep dependencies purposeful.

## Test requirements
Automated unit/model tests, build/syntax checks, end-to-end browser tests and visual snapshots where available. Full complex broadcast fixture coverage, not just blank editor; include long text, rotated graphics, crop, embedded font/image, nested/group transforms, invalid SVG/project, undo/redo, live resize, repeated edits, HD/4K and custom export dimensions, DPR/zoom parity, autosave failure and mobile/desktop.

Run tests after repairs, collect exact commands/commit/workflow/screenshot/export evidence in TODO.md, and keep failures open. A passing build alone does not validate application behavior. When browser tools unavailable, say exactly what is missing and run strongest alternatives; never infer a pass.

## Required project ledger
TODO.md must give current state, current milestone, dependency-ordered tasks with stable IDs, status TODO/IN PROGRESS/BLOCKED/DONE, concrete acceptance criteria, evidence, regressions/blockers, and immediate next tasks. Never delete unfinished tasks to present a false completion. Commit updates after meaningful verified batches.

## Completion report
After confirming fresh-checkout install/build/run, report what actually works, actual tests and UI/export checks, changed files and commit hashes, known gaps and blockers. Never claim production-ready before real browser/export verification.
