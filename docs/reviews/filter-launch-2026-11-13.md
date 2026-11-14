# Product Excellence Review — Project filter and Unknown
Reviewed at: 1440×900, 1280×720, 375×812, 720×450, 320×812; dark/light · Console: clean · Scope: Habits & usage filters, with Settings as the existing control reference
Verified on: local · Regressions: no saved filter checks; existing browser/data suite passes
Browser risk: native Popover API for Time requires a modern browser (pre-existing); native select arrow-key interaction could not be automated in this macOS headless Chrome, including a bare control without app code. Programmatic option selection, keyboard reachability, focus and Enter-to-reset passed.

## Verdict
Ship, then confirm on production — Unknown remains filterable at the bottom, and all scoped layout, data and recovery checks pass.

## Findings
| # | Pri | Effort | Pass | Finding |
|---|-----|--------|------|---------|
| — | — | — | All | No new findings in the filter shipment. |

### Existing surface drift outside this shipment

The skill frontmatter's description starts with “Reviews how you work with AI” while the listings and site use the approved one-line description. This predates the filter diff. No marketing behavior or claims were added to resolve it. A separate copy pass can align that opening while preserving the skill's discovery triggers.

## What's working

- Visual rhythm: the desktop controls match the existing launched canvas order. Phones retain Time/count together; every tested viewport has no page or filter overflow. Long repository names stay selectable.
- Accessibility measurements: filter labels and selected text meet 4.5:1 in both themes; selects have associated labels and 44px mobile targets. Tab reaches Clear with visible focus and Enter resets every selection. This is automated browser checking, not a screen-reader certification.
- Returning desktop user: select a repository, App and Work, change Time, switch all five Habits tabs and clear. Counts, charts and tables retain the selected project and date boundaries.
- Reader with older history, using a phone or keyboard: Unknown includes legacy/missing metadata; the no-match result retains its outside count and reset path. No guessing or reassignment is implied.
- Launch readiness: the report deep link cold-loads correctly, internal anchors resolve, the report title/favicon remain, and the built report matches its source template. Overview and its landing screenshot are unchanged. The standalone report has no share-card image; this pre-existing report format is outside the filter change.

## Verification evidence

- Eight synthetic Python tests and `tests/report-designs.mjs` pass, including daily/weekly conservation, worktrees, legacy rows, project intersections, an Unknown bucket larger than named projects, reserved names and 40 long repository names.
- Report and palette checks, ESLint, TypeScript and whitespace checks pass.
- `PAGES_BASE_PATH=/second-look npm run build -- --webpack` passes. Local Turbopack cannot bind its build-worker port; CI uses the repository's unchanged default build.
- Scope-specific rendered measurements/screenshots: `/tmp/second-look-unknown-launch`; regression screenshots: `/tmp/second-look-unknown-qa`. These temporary paths are evidence for this workstation, not published assets.
- A 365-day real collector smoke check verified project availability and aggregate payload size. Private prompts, identifiers, paths and repository names were not written to this repository or release notes.
- After deployment: repeat the core filter/reset checks on the live deep link and compare the served report with the committed template. Download the release ZIP and verify each included skill file against the release commit.

## Release scope

The existing filter script and native selects are extended; no new component library or colors. New bounds are a 200px desktop select width and 140px mobile reservation for the count. Product source, README, glossary, design guidance, plugin version and v0.5.0 ZIP are synchronized. Install commands, site metadata, FAQ and the unchanged Overview screenshot need no filter-specific edits. GitHub About already matches the approved description and remains unchanged. The Your views proposal stays uncommitted. Existing installed skills and private reports are not mutated.

All nine canvas filter rows already live on the launched page and use All projects as their selected sample. No open Project menu or old Unknown wording is drawn there, so no artboard edit or move is needed for this label change.
