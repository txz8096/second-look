# Project filter

Status: implemented and verified on 2026-11-13; shipping as v0.5.0. Ships before Your views
(`your-views-spec-2026-11-13.md`), which can then save a project in a view's filter.

## Goal

Let every user filter the report by project, next to Time, App and Work. This is a standard
report filter for all users, not a customization feature.

## How a session gets its project

Claude Code and Codex record each session's working folder as `cwd` (checked in one log from
each, 2026-11-13). Cursor and Antigravity haven't been checked. The collector now reads `cwd` for Claude Code and Codex. Other apps remain
under "Unknown" until their folder metadata is verified.

A folder name alone isn't a reliable project. Some apps create a new folder for every chat
(Codex desktop uses dated scratch folders), and many people keep a general-purpose folder for
unrelated work. Rule:

- **Inside a git repository:** the repository's top-level folder name. Worktrees map to their
  main repository.
- **Anywhere else** (home folder, scratch folders, plain folders): "Unknown".
- **Apps or exports with no folder** (claude.ai, ChatGPT, Gemini): "Unknown".
- Only the name is kept, never the full path.

Why git repositories: a repository is the clearest sign that a folder is a project. Using every
folder name would fill the list with one-off chat folders. The cost: sessions about a project
that ran outside its repository don't count toward it. The measurement below shows how big that
cost is.

**Measure before shipping:** run the collector on real logs and report, per app, the share of
sessions with no project. If an app's sessions mostly have none, the docs say the filter works
best for that app's sessions run inside a repository.

## Data

Weekly cube rows use `project` as a key next to `week`, `source` and `category`, with the same
additive `days` totals. Older rows in `history.json` have no project. They stay as they are,
count under "Unknown", and are never split or guessed.

## Report

A Project dropdown joins Time, App and Work and follows the approved filter rules: counts, charts
and share tables use one selection; Clear resets to All projects; filtered-empty copy
names the outside count. Named projects are ordered by session count; Unknown stays last as a separate option.
Melissa approved the concise Unknown label and this placement on 2026-11-13.

## Acceptance criteria

1. Picking a project changes the counts, charts and share tables together and keeps the Time,
   App and Work choices.
2. Clear resets to All projects.
3. Older history rows without a project count under "Unknown" and are never dropped.
4. Two worktrees of one repository show as one project.
5. No full path appears anywhere in the report.

## Local implementation choices

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
reports need an explicit update or regeneration. Melissa requested commit, push and deployment
with “ship it” after approving Unknown as the label.
