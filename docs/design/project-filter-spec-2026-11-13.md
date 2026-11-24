# Project filter and available history

Status: revised decisions approved by the author on 2026-11-13. Implemented in v0.6.0 (`8a68d30`,
2026-11-15): non-Git folders in Claude Code, Codex and Cursor, automatic grouping with separate,
merge and rename, source-preserving backfill and All history. Fixed 2026-11-19: folders an app names
with a random ID (for example `~/.pencil/documents/<uuid>`) are Unknown, and history rows saved before
project IDs join the project with the same name. Still open: native project membership in apps and
cloud exports, which no adapter reads yet. The previous Git-only release record is retained below.
Your views (`your-views-spec-2026-11-13.md`) uses the same project identities and time controls.

## Goal

Follow the user's existing project organization across apps, without requiring Git or GitHub.
Automatically combine matching projects and let users correct exceptions. Let users explore all
available history, including more than 12 months.

## How a session gets its project

Use explicit app project membership first, then a user-selected workspace/project folder. A plain
folder qualifies without Git. When only a working directory is recorded, resolve a verified workspace
root or repository root where possible; subfolders are not automatically separate projects. Worktrees
map to their main repository. Do not infer project membership from conversation topics.

Known generated scratch folders, general home directories and sessions without usable project
metadata appear under **Unknown**. This means Second Look could not identify the project, not that
the user never assigned one. Unknown remains the final dropdown option.

Claude Code and Codex currently supply `cwd` to the collector. Inspect real, consented fixtures for
native project IDs/names and workspace roots in each supported app and export before implementing its
adapter. The presence of Projects in an app does not prove its exports include membership. Missing
metadata remains Unknown; do not claim an app cannot supply projects without verifying it.

Project and employer names may appear in private reports. Full filesystem paths must not appear in
reports; public samples use fictional names.

## Automatic grouping and corrections

Automatically combine matching project names across apps without a confirmation prompt. As the
initial deterministic matching rule, normalize case, surrounding/repeated whitespace, and hyphens
versus spaces: `Second Look`, `second-look` and `second look` form one project. Keep the original
labels and source membership internally. Do not use fuzzy/topic similarity to merge different names.
This normalization is an implementation proposal to verify with fixtures, not a separately approved
user decision.

A name is a display label, not the durable identity. Keep stable source IDs when available and a
persistent local mapping from source identities to a canonical project ID. Names alone must not erase
source distinctions: users need to be able to undo an automatic grouping without losing history.

- Matching names combine by default, including coincidentally matching names. If the user says two
  are unrelated, persist a separation override and add an app or short workspace label as needed.
- Explicit user merge/separation/rename mappings take priority over automatic name matching on every run.
- A native project rename with the same source ID preserves history and saved views.
- Folder moves/renames preserve identity when verified. If continuity cannot be established, offer
  “Same project?” rather than silently reassigning history based on a guess.
- Different names can be combined through a user instruction; remember the aliases.
- Saved views use canonical IDs, so changing a display name does not break them. Merges retain redirects
  from old IDs. If a user splits a project, ask which resulting group a saved view should track; until
  resolved, show an explanation instead of choosing silently.

The exact mapping schema and location are implementation work. Preserve enough source-level history
to recompute groups after a correction; storing only combined totals would make separation impossible.

## Data and backfill

Weekly cube rows retain project alongside week, source and category, with additive daily totals.
Backfill means rereading available older raw sessions to recover their recorded project metadata;
it does not mean inventing older data or extending the time window by itself.

Replace corresponding aggregate rows when rebuilding from raw sessions; never add the rebuilt rows
on top of existing totals. Preserve older aggregate history whose raw sessions are no longer available.
Rows whose project cannot be recovered remain Unknown. Repeated backfills must not change totals or
duplicate sessions. Project resolution should use stored mappings when the original folder is gone;
without sufficient evidence it remains Unknown.

## Time filter: all available history

Remove the fixed 12-month/52-week ceiling throughout collection, history merging, report embedding,
chart indexing, date bounds and validation. Keep the existing 4-week, 3-month, 6-month and 12-month
presets, and add **All history**. Custom From/To dates can span the earliest available history through
the latest eligible date. Keep the existing 12-month default and complete-week boundary for now;
12 months is a default view, not a retention limit.

Never truncate stored history solely because it is older than a year. Reuse saved aggregates and
incrementally collect new data; historical recovery can reread available raw logs. Do not change the
host app's raw-log retention settings automatically. Missing periods remain unmeasured, never fabricated
zeros. Show the actual available date range. With no history, show an empty state.

Project options come from available report history, not imaginary or deleted data. A selected time
range with no matching sessions shows an empty state without discarding the project selection.
Saved views remain visible with an explanation when their project has no data in the report.

## Report scope

Time, App, Work and Project filter Habits & usage counts, charts and share tables together. They do
not filter report-wide findings or fixes. Place and explain the controls so their scope is clear.
Clear resets Project to All projects and retains the report's documented reset behavior for other
controls. Named projects sort by session count; Unknown stays last and appears only when represented.
No lossy “Other projects” bucket.

Your views uses the same all-history time controls, with each view's saved App/Work/Project selection.

## Acceptance criteria for the revision

1. Explicit native projects and verified user-selected non-Git folders can identify sessions.
2. Temporary/unresolved locations appear as Unknown; full paths never appear in reports.
3. Matching names across apps automatically form one project; separation overrides survive reruns.
4. Verified renames preserve history and saved views; two worktrees map to their main project.
5. Backfill recovers available historical metadata without duplicating totals; unavailable metadata
   stays Unknown and existing aggregate history is preserved.
6. A synthetic dataset spanning at least three years remains intact across collect/merge/render/check.
   All history and a custom range older than 12 months show the correct values.
7. Existing presets, exact-date filtering, reset behavior and minimum sample rules still work.
8. Filtering changes counts, charts and share tables together, without filtering findings or fixes.
9. A saved project missing from current data produces an explanation, not a fatal report error.
10. Test empty, sparse and long histories, same-name collisions, cross-app matching, rename, split,
    merge, missing raw logs and deleted folders. Measure real per-app Unknown coverage, project sample
    sizes, report size and render time; do not set an arbitrary coverage cutoff.

## Implementation and surface checklist

- Collector: verify adapters, implement persistent identities/overrides and source-preserving backfill.
- History: remove truncation, replace rebuilt aggregates safely, preserve provenance needed for splits.
- Template/checker/tests: dynamic history bounds, All history, project IDs and missing-data states.
- Wonder: preview one existing canvas with the extended Time menu before applying matching screens.
- Skill/design guidance, README, glossary and relevant website copy: update only when behavior ships.
  Current Git-only and 12-month descriptions remain descriptions of the existing product until then.
- Release zip: a new skill release is needed when implementation lands. Retake the landing preview
  only if Overview changes. Check plugin descriptions and GitHub About for affected promises; ask
  before changing the public About box.

## Previous Git-only implementation record (2026-11-13)

- Desktop order: Time, App, Work, Project, Clear, count, matching the launched canvas.
  App is now a single-select dropdown like Work. The existing shared filter row moves with
  the selected Habits & usage tab, so all five tabs receive these changes.
- Phones keep Time/count together; the remaining controls wrap with 44px touch targets.
- Every project stays selectable in a native dropdown, with no lossy "Other projects" group.
  Long selected names fit a bounded control; the full option remains in the native menu.
- The sample uses fictional Streak, Atlas and Fieldnotes repository names, without changing
  the existing sample totals or dates. Sample apps without verified folder metadata remain
  under Unknown.
- The drafted git-only project rule is used for this local implementation. Cursor and
  Antigravity metadata discovery remains outside this change.

## Release validation

The 365-day collector smoke check ran on local logs, inspecting only per-app unknown counts
and aggregate payload sizes. No prompt text, paths, repository names or session identifiers
were saved in the repository. Project rows kept the payload under 100 KB on this machine.
Claude Code and Codex had identified repositories for most sessions; Cursor remains Unknown
because its folder metadata is not yet verified. Documentation states that Project works best
for Claude Code and Codex sessions run inside an existing repository.

The v0.5.0 release zip carries the updated skill. Existing private reports need regeneration;
installed skills are not changed by this shipment.

## Verification (local, 2026-11-13)

- Eight synthetic Python tests: repository/worktree resolution, recorded metadata before the
  requested window, project aggregation, legacy history and duplicate/path validation.
- `tests/report-designs.mjs`: dark/light at 1440, 390 and 320px; Time/App/Work/Project
  intersections, exact dates, preserved selections, reset, empty recovery and 40 long names.
- Rendered screenshots inspected in `/tmp/second-look-filter-qa`.
- Report checker, chart palette checker, ESLint, TypeScript and `git diff --check` pass.
- Production build passes with `npm run build -- --webpack`. Default Turbopack cannot bind its
  build-worker port in this environment; webpack needed network access for existing fonts.
- `/sample-report.html` on the existing localhost:3000 server matches the source template.
  That server predates this work. Wonder's separate Preview could not start while it owns
  port 3000; the existing server was left running.

The landing screenshot stays unchanged because Overview's totals and visuals are unchanged.
Install commands, plugin listings, metadata and FAQ make no filter-specific promise and remain
unchanged. The v0.5.0 release zip is prepared from the committed skill; installed skills and old private
reports need an explicit update or regeneration. The author requested commit, push and deployment
with “ship it” after approving Unknown as the label.
