# AGENTS.md — Television News Screen Layout Designer

## 1. Role and mission

Act as a senior product designer, interaction designer, visual systems designer, and front-end engineer. Independently plan, implement, verify, and refine a **professional web application for producing ultra-high-fidelity, static television news screen mockups**.

Your work is judged by the usability of the editor, precision of its controls, fidelity of its output, reliability of saved projects, quality of its architecture, and completeness of the actual implementation—not by the quantity of features, documentation, or code.

The application is a **static layout editor**, not a broadcast system, animation tool, or video editor. Do not implement moving tickers, playback, live feeds, transmission, or temporal editing.

## 2. Source of truth and required working files

Read `CLIENT_SPEC.md` **in full before making design or implementation decisions**. Locate the file at the project root, or find its existing canonical location in the repository. Do not substitute assumptions, an unrelated app concept, or instructions from a previous project.

Use the following precedence for product decisions:

1. `CLIENT_SPEC.md` — binding product requirements and exclusions.
2. `AGENTS.md` — development workflow, design standards, and acceptance discipline.
3. `DESIGN.md` — your documented solution to the requirements.
4. `TODO.md` — the executable, continuously maintained implementation and verification plan.
5. Existing project conventions — preserve them where compatible with the above.

If a design choice conflicts with the client specification, revise the design rather than silently narrowing the requirement. If a requirement is technically uncertain, investigate it, document the tradeoff, and plan a concrete proof of feasibility.

**Before implementing app features**, inspect the project and create or update both:

- `DESIGN.md` — the actual proposed product, UX, visual system, feature set, data model, architecture, and acceptance strategy.
- `TODO.md` — a dependency-aware, actionable checklist derived from the client specification and `DESIGN.md`.

Do not stop at writing these files. Once the plan is credible, proceed with implementation, testing, corrections, and refinement. Keep both documents synchronized with real decisions and behavior.

## 3. Mandatory workflow

### Phase A — Understand and inspect

1. Read `CLIENT_SPEC.md` completely, including quality criteria and out-of-scope items.
2. Examine the repository, existing app, tooling, tests, assets, configuration, and any established conventions.
3. Identify existing capabilities that should be retained; avoid replacing working code without a reason.
4. Examine relevant professional layout, graphics, and broadcast-news UI conventions where references and browsing are available. Distinguish observed patterns from assumptions; use references for understanding, not for copying an entire interface.
5. Translate each client requirement into observable editor behavior and a practical acceptance test.
6. Identify the main technical risks early, especially canvas/export consistency, text rendering, asset portability, and transform precision.

### Phase B — Design before coding

Consider more than one viable implementation approach where architecture or usability materially differs. Choose deliberately, weighing fidelity, maintainability, speed, interaction quality, and testability.

Write `DESIGN.md` with the sections required in §4. Then build `TODO.md` from that design and the entire client specification. Define usable vertical slices that can be implemented and verified incrementally.

Do not mistake an attractive UI mockup for a complete design. Plan the behavior of all major tools, controls, data structures, input methods, exports, and failure states.

### Phase C — Implement in verified slices

For each slice:

1. Select the next dependency-ready item(s) from `TODO.md`.
2. Confirm the intended behavior and acceptance criteria.
3. Implement a complete working behavior, including applicable loading, empty, error, and recovery states.
4. Test the behavior in the running application, not only in isolated code.
5. Inspect the interface and correct observable visual or interaction problems.
6. Update `TODO.md` **immediately** with actual status, verification evidence, limitations, and newly discovered work.
7. Update `DESIGN.md` when a meaningful design or architecture decision changes.

Continue until the client specification is implemented and acceptance evidence is available, or until a genuine environmental blocker prevents further work. Do not label incomplete or untested work as finished.

### Phase D — Full-system QA and refinement

Run end-to-end editing, save/reopen, export, visual-fidelity, accessibility, and responsive-layout tests. Correct failures and retest. Inspect actual screenshots and exported image files at their intended resolutions. Perform a deliberate final usability and visual polish pass.

## 4. `DESIGN.md` — required content

Write a concrete design document, not a generic statement of intentions. Cover:

1. **Product definition:** intended users, core task, main workflows, supported output, explicit exclusions.
2. **Requirements matrix:** every client requirement mapped to proposed behavior, module, and acceptance criteria.
3. **Information architecture:** workspace structure, navigation, starting state, panels, toolbars, dialogs, inspector, asset browser, layers, presets, and export workflow.
4. **Interaction specification:** selecting, multiselecting, dragging, resizing, rotating, cropping, replacing media, editing text, snapping, alignment, guides, grouping, locking, duplication, layering, zoom, pan, keyboard shortcuts, undo/redo, and recovery.
5. **Visual design system:** typography, spacing, geometry, visual hierarchy, controls, palettes, surfaces, icons, focus states, and responsive behavior; include actual tokens as implementation progresses.
6. **Preset and channel system:** built-in fully editable news-screen layouts (including Fox News–style examples), reusable custom channel identities, logos, typography, palettes, placeholder regions, and user-defined presets.
7. **Scene/document model:** canvas coordinates, target output dimensions, hierarchy, element types, transforms, crop/mask model, z-order, styles, constraints, identifiers, asset references, and versioning.
8. **Rendering and export strategy:** how editor and exported output share layout logic, how fonts and assets are resolved, how scaling and pixel density work, and how visual parity is verified.
9. **Project persistence:** portable editable file format, embedded/referenced media, custom fonts, migration, validation, autosave if implemented, and recovery from corrupt or incomplete files.
10. **Technical architecture:** chosen stack, modules, dependencies, event/state management, rendering boundaries, performance strategy, and important tradeoffs.
11. **Responsive and accessible UX:** desktop-first professional editing, meaningful tablet/mobile adaptations, keyboard operation, touch interactions, screen-reader semantics for controls, and zoom behavior.
12. **Testing and acceptance:** unit, integration, browser, visual-regression, persistence, export, failure-path, and manual review strategies.
13. **Known risks and decisions:** assumptions, open questions, alternatives rejected, and how uncertain capabilities will be validated.

Keep `DESIGN.md` descriptive of the **actual chosen application**. Clearly distinguish proposed, implemented, and deferred details. When changing direction, update the document rather than leaving contradictory plans.

## 5. `TODO.md` — living plan and progress ledger

Create `TODO.md` before implementation. Structure it into ordered milestones, with small, verifiable tasks and explicit acceptance criteria. A sensible initial breakdown is:

1. Repository inspection, requirements coverage, design, technical proofs.
2. Application shell, layout, design tokens, responsive foundations.
3. Document model, scene graph, editor viewport, selection, transforms.
4. Layers, groups, locks, precision controls, alignment, snapping, history.
5. Images, clipboard paste, SVG, replacement regions, cropping, vector graphics.
6. Typography engine, advanced text editing, font loading and packaging.
7. Broadcast components, editable presets, custom channels, preset saving.
8. Project persistence, import/export, corruption recovery, portability.
9. High-resolution image export and measured canvas/output fidelity.
10. Integrated UX, performance, accessibility, browser and visual testing, refinement.

Adjust the milestones to the repository and design; do not mechanically preserve this order if dependencies dictate otherwise.

Each significant task should contain:

- A stable identifier and clear deliverable.
- Status: `TODO`, `IN PROGRESS`, `BLOCKED`, or `DONE` (checkboxes may supplement status).
- Dependencies or blockers when relevant.
- Observable acceptance criteria.
- Test result/evidence when completed (test command, browser path, screenshot comparison, or concrete manual verification).

Maintain a short **Current state** section identifying the active milestone, completed work, next actionable tasks, blockers, and outstanding regressions. Update it whenever meaningful progress occurs, not merely at the end of a session.

**Rules:**

- Never mark a feature `DONE` solely because code was written or a component rendered. Verify the actual user behavior.
- A failing, skipped, or unavailable test is not a pass. State which evidence is missing.
- Add newly discovered bugs and edge cases as explicit tasks; do not hide them in prose.
- If an item expands in scope, split it into independently testable subtasks.
- Do not delete unfinished tasks to make progress appear complete.
- When resuming, read `CLIENT_SPEC.md`, `DESIGN.md`, and `TODO.md`; inspect the actual repo state before selecting work.
- Preserve a truthful distinction among implemented, partially working, planned, and blocked capabilities.

## 6. Editor product requirements

The spec defines the baseline; implement it as one coherent editor rather than a collection of disconnected demos.

### Presets and brand identity

- Offer multiple substantial, visually credible, fully editable broadcast-news presets, including Fox News–style compositions and other distinct broadcast treatments.
- Presets must consist of editable native scene elements—not single flattened pictures.
- Allow users to create and manage custom channel identities with logos, fonts, color palettes, and reusable design decisions.
- Include editable lower thirds, headline blocks, tickers, LIVE indicators, clocks, split-screen compositions, imagery, and placeholders. These remain **static** even when their real-world counterparts typically move.
- Make swapping channels or presets predictable; avoid unexpected loss of user modifications.

### Canvas and document editing

- Provide direct manipulation with accurate selection handles, hit-testing, drag, scale, rotation, crop, and duplication.
- Support numeric editing for position, dimensions, angle, and relevant spacing, with sensible units and consistent precision.
- Support multi-selection, nested layers/groups where justified, stacking order, locking, guides, snapping, and alignment/distribution.
- Support undo/redo for meaningful document edits, including changes made through the properties inspector, without corrupting state or losing selection unexpectedly.
- Treat zoom and pan as **viewport-only** operations; they must not alter document geometry or exported layout.
- Distinguish selectable, locked, hidden (if implemented), clipped, and grouped elements visually and behaviorally.

### Media and graphics

- Accept PNG, JPEG, and SVG uploads; handle clipboard image paste and useful paste errors gracefully.
- Allow users to place/replace media into designated placeholder regions with non-destructive crop/fit/position adjustments.
- Support editable logo/image elements and basic vector shapes with fills, strokes/borders, gradients, shadows, and opacity.
- Establish clear behavior for missing files, invalid formats, oversized assets, incompatible SVG content, and export-blocking cross-origin resources.
- Prevent unsafe active content from imported SVGs; treat user assets as data, not executable markup.

### Typography

- Every textual broadcast element must be editable, including headlines, tickers, labels, badges, and clocks.
- Support font selection and user-supplied fonts, with controls for weight, size, line height, letter spacing, alignment, outlines, shadows, and other relevant typography settings.
- Handle text overflow, wrapping, clipping, baseline/alignment, and varying font metrics deterministically.
- Ensure custom fonts are available after project export/import and during image rendering, not only during the initial editor session.

### Projects, presets, and output

- Save and import **fully editable** project files retaining scene structure, images, vector objects, text, styles, fonts, positioning, and custom channel settings.
- Save custom compositions as reusable presets without flattening their editable structure.
- Export crisp static images at configurable dimensions, including standard HD and 4K targets. Preserve the intended aspect ratio and make any resizing/cropping behavior explicit.
- Prefer a lossless export path for fidelity. Additional formats are optional unless required by `CLIENT_SPEC.md`.
- Verify that reopened projects reproduce the original scene and that exports visually match the editor's intended composition.

## 7. Rendering and fidelity are first-class engineering concerns

Treat **export fidelity** as a foundational design constraint, not a finishing task.

- Maintain one canonical document/scene model. Avoid separate hand-maintained export layouts that drift from what the editor displays.
- Define document coordinates, transform composition, crop semantics, element bounds, stroke scaling, text measurement, and output scaling precisely.
- Prefer a shared rendering pipeline or a clearly tested equivalence contract between editor and exporter.
- Ensure crisp vector edges, high-quality image resampling, deterministic layering, correct clipping, and reliable font loading.
- Avoid using a low-resolution screenshot of the editor as the high-resolution export method.
- Do not let viewport zoom, UI scale, device pixel ratio, selection outlines, guides, or editor chrome contaminate exported artwork.
- Test multiple sizes and aspect ratios, transparency where supported, long headlines, narrow text containers, shadows, outlines, and combined transforms.
- Use reference screenshots and exported images to identify visual deltas. Track and resolve discrepancies in typography, alignment, crop, color, and effects.
- If browser or library limitations prevent exact parity for a feature, disclose the limitation and select a deterministic fallback rather than presenting inaccurate output as faithful.

## 8. UX and visual quality

Design a purposeful **professional graphics editor**, not a generic dashboard.

- Give appropriate visual priority to the canvas, layer hierarchy, properties inspector, preset workflow, and high-frequency editing tools.
- Balance editing density with clarity: experienced users need power without burying simple tasks in deep menus.
- Favor clear grouping, precise alignment, deliberate spacing, consistent controls, useful defaults, and visible interaction feedback.
- Avoid decorative card grids, repetitive oversized panels, gratuitous gradients, fake status indicators, meaningless badges, excessive copy, ornamental sidebars, and non-functional controls.
- Make primary editing actions easy to discover. Use contextual or progressive disclosure for infrequently used advanced settings.
- Ensure selection states, hover/focus, drag targets, active tools, disabled controls, loading, empty states, errors, and destructive actions are consistently presented.
- Use native controls when they are more reliable. Any custom control must preserve keyboard interaction, focus management, accessibility, and touch usability.
- Provide predictable shortcuts and context menus where useful; avoid capturing keys while users type in text fields.
- Make dialogs and panels resilient to content length, viewport changes, keyboard opening, and browser zoom.
- Design desktop intentionally; adapt tablet and smartphone workflows without pretending a narrow mobile screen can expose every desktop panel simultaneously.
- Respect reduced-motion preferences. The application content remains static regardless of UI feedback effects.

## 9. Technical quality and robustness

Choose the web stack based on the actual repository and product needs. Do not assume a particular hosting platform, framework, or file structure unless the project explicitly requires it.

- Separate document state, transient UI state, rendering, interaction tools, asset handling, typography, presets, persistence, and export.
- Use typed data structures or schemas when available; validate imported project data and version the format.
- Keep scene edits transactionally consistent, especially grouped transforms and undo/redo.
- Avoid unnecessary global mutable state, fragile DOM coupling, and full-rebuild rendering on every pointer move.
- Keep pointer interactions smooth under representative scene complexity.
- Manage object URLs, image bitmaps, fonts, event listeners, and memory lifetimes carefully.
- Handle malformed imports, interrupted uploads, storage quota failures, asset decoding issues, export errors, and stale saved data with actionable recovery.
- Preserve user work across avoidable failures; confirm truly destructive operations.
- Keep dependencies purposeful, documented, and maintainable. Run existing lint, type-check, build, and test commands.
- Do not weaken security or quality checks to force a green result.

## 10. Verification and acceptance

Test the running app with realistic, complex news-screen compositions—not merely blank scenes or isolated component demos. Cover:

**Editing:** initial load; creating a design; choosing and modifying presets; custom channels; image paste/upload/replace/crop; SVG handling; typography; numeric controls; transforms; snapping; alignment; layers; groups; locking; z-order; duplication; multi-selection; shortcuts; zoom/pan; undo/redo.

**Project lifecycle:** new/save/load; reload; export/import; custom fonts and assets; custom presets; older/corrupt files; missing assets; serialization determinism; recovery after failed operations.

**Output quality:** HD, 4K, and custom dimensions; editor/export comparison; text baselines and line breaks; asset scaling; crop accuracy; vectors, shadows, gradients, and opacity; absence of editor-only overlays in exports.

**Reliability:** rapid repeated edits; drag cancellation; extreme numeric inputs; empty and long text; malformed media; storage and export failures; multiple open dialogs; scene complexity; memory pressure where testable.

**Usability:** keyboard-only paths, focus order, contrast, labels, touch interaction, overflow, dense panels, popup placement, browser zoom, desktop/tablet/mobile layouts, and orientation changes.

Where tools permit:

1. Run automated tests, lint, type checks, and production build.
2. Use a browser to exercise critical flows end to end.
3. Capture and inspect screenshots at representative viewports and editor states.
4. Inspect the actual exported images and reopened project files.
5. Compare known scenes before/after project round trips and canvas/export paths, preferably with automated visual-difference checks and documented tolerances.
6. Repeat failed tests after repairs and record results in `TODO.md`.

Do not claim a test passed if it was not run. If browser tools or visual comparison are unavailable, record the exact limitation and complete the strongest available alternative verification.

## 11. Completion criteria and reporting

A feature is complete only when the corresponding UI, underlying behavior, state transitions, validation/error handling, persistence as applicable, and acceptance checks all work together.

Before finalizing:

- Confirm every client-spec requirement is implemented or explicitly reported as blocked/incomplete.
- Confirm `DESIGN.md` reflects the finished architecture and UI; no fictional capabilities.
- Confirm `TODO.md` accurately identifies finished, unfinished, blocked, and failed work with evidence.
- Remove dead controls, debug UI, placeholder-only behaviors, and unresolved visual inconsistencies.
- Ensure a fresh checkout can install, build, launch, and exercise the app following `README.md`.
- Provide a concise final report: what works, verification performed, files changed, remaining limitations, and exact blockers. Do not call an unverified implementation production-ready.

## 12. Operating principles

- **Read the specification first. Design deliberately. Plan visibly. Implement completely. Verify empirically.**
- Prefer meaningful, correct functionality over speculative extras.
- Preserve the user's ability to edit everything the specification promises.
- Never trade output fidelity for a superficially attractive editor preview.
- Never treat documentation, screenshots, mockups, or successful builds as substitutes for working interactions.
- Do not ask for decisions that can reasonably be made from the specification and codebase; document important assumptions and proceed.
- Keep `TODO.md` current throughout development so another agent can resume without reconstructing progress.