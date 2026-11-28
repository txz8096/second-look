# Second Look report design system

The source of truth is `report-template.html` (a filled-in sample report).
Build every report from a copy of it. Keep its doctype and `<html lang>` lines, charset and viewport lines, `<style>` block, font links, logo and scripts
exactly as they are. Without the viewport line, phones render the page at desktop width and shrink the text. Change only the text, the table rows, the cards and the data values at the top of the trends script (`END`, `CUBE`, `SCOPE`, `MILESTONES`).
`scripts/check_report.py` also fails a report whose text uses a banned word, that still has the template's sample data, whose script has a syntax error, whose `END` doesn't match its cube or is the week in progress, whose cube repeats a row, whose summary quotes a metric or has term cards, or whose cube or scope has a source id the script doesn't know. Names and quotes from their own sessions are left out of the word check.
`scripts/check_report.py` fails any report whose styles differ from the template.
The `<style>` block is one layer, written in page order. Change a rule where it lives; don't
append overrides at the end.

## Tokens

The values below are the dark theme, which is the default. The app bar's switch sets `data-mode="light"` on `<html>`, and `:root[data-mode="light"]` in the template overrides the tokens with shadcn's light neutrals and a darker pink for text and chart series (`--accent` `#B02A55`, `--series` `#D1416B`). `--accent-fill` stays Proof Pink in both, for the logo's underline. Components use tokens only, so a new color goes in both blocks. The choice is saved in `localStorage` as `second-look-theme`.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0A0A0A` | Page background |
| `--surface` / `--surface-2` | `#171717` / `#262626` | Cards, buttons, menus / neutral fills, tracks |
| `--fg` | `#FAFAFA` | Text |
| `--primary` / `--on-primary` | `#E5E5E5` / `#171717` | Open in <app> buttons, the Review, Behind and Duplicate pills |
| `--muted` / `--faint` | `#A1A1A1` / `#8A8A8A` | Secondary text, labels |
| `--term-quiet` | `#737373` | Dashed underline on chart titles |
| `--line` / `--line-strong` | white at 10% / 15% | Dividers, borders |
| `--accent` | `#F2A7B8` (Proof Pink) | Links and action highlights |
| `--accent-soft` / `--accent-soft-2` | pink at 8% / 28% | Pink panels and their borders |
| `--on-accent` | `#0A0A0A` | Text on pink fills |
| `--p1` | `#FF6568` | A broken or stale skill, high risk. States only |

The neutrals are shadcn/ui's dark theme, written as plain CSS: the report stays one file, so it uses the look and none of the React components. The one status colour (`--p1`) marks states, such as a broken skill. Never use it to grade the user's habits:
changes in their numbers are plain text, and "best" cells are pink, never green or red.
Pink marks the things to act on: recommendation panels, the follow-up group headers, the open question in the sidebar and action counts. Independent chart series and labeled bar rows use pink; stacked categories use the palette below.

**The signature.** Neutral cards with hairline borders hold the findings, charts, panels and tables; headers are never filled. The recommendation in each pattern is a pink panel with a pink hairline. No side stripes on panels.

## Type

Inter for body text and Manrope for headings. Use JetBrains Mono for code and quoted prompts. Headings 700, letter-spacing
-0.025em.

| Role | Size |
|---|---|
| Part title (`.part-head h2`) | 32px |
| Summary, section headings | 20px |
| Pattern title | 18px |
| Part headline, recommendation panel title, chart and panel titles, chart group summary | 16px |
| Card text, tables, tabs, notes | 14px |
| Labels (sentence case, weight 500, muted), code, small notes | 13px |
| Chips | 12px |

Running text, tables, charts and code blocks all use the full column. Pasted text and the automation counts are set in JetBrains Mono; a quoted prompt sits on a neutral rule beside what came of it.

A list of AI apps anywhere in the report separates the names with commas, never middle dots: "Claude Code, Codex, Cursor, claude.ai".

No uppercase labels. On phones (680px and narrower) the template raises the floor: small text 14px, card body 16px, chart axis text 12px, and buttons, chips and
section toggles at least 44px tall, and Copy sits in the block's left corner, clear of the
contents button. Under 600px, the script turns each table row into a small
card (the first cell leads, a lone chip or pill takes the corner, the rest read "label  value",
aligned for numbers and run in for part 3's words; a table with the `unlabeled` class, like the model table, drops the labels), so nothing scrolls sideways; `prerender.py`
saves those rows, and without either, tables scroll. Without scripts, Copy buttons stay hidden. Charts that didn't move wait behind one
"Show N more charts" button. The template's styles already do this, so a report gets it by keeping
them.

## Radii

6px tooltips and the chosen filter · 8px buttons, inputs, sidebar links, the data coverage card, code blocks and the filter track · 10px recommendation panels · 14px cards, tables and the report menu ·
fully rounded chips.

## Page structure, in order

An app bar, a sidebar and one page at a time, from the "Compact App Bar" designs (Nov 6, 2026). Scripts off, every page shows in turn and the links still work.

1. App bar (64px, stays on screen): the sidebar toggle and logo on the left; the report menu (`#report-menu`, a `details` that works with scripts off) the Feedback link (`#report-issue`, to https://github.com/txz8096/second-look/issues/new) and the light and dark switch (`#theme-btn`, hidden with scripts off) on the right. The menu shows "Latest report" or "Earlier report" with this report's date, and opens a scrolling list of every saved report, newest first, with the latest marked. `scripts/report_menu.py` writes the list between the `report-menu` comments, using relative links, and switching reports stays on the same page. With one report, or on claude.ai, it's a plain label. Phones (680px and narrower) show only the month and day, so the bar fits. The sample report's earlier dates are plain text, since it has no other reports to open.
2. Sidebar (`#side`, 256px; a drawer at 900px and narrower): Overview, Recommendations, Skills, Habits & usage, Settings, with no numerical counts or badges. While Habits & usage is open, its item turns plain (no pink) with a chevron pointing down and opens into the five questions (`#habit-questions`), indented under a left rule, 13px, 36px tall (44px on phones); the open question is pink on the soft pink fill. On other pages Habits & usage is a plain link. On desktop it stays pinned below the app bar and fills the available viewport height, with method, References, and About at the viewport bottom. Long references scroll inside the sidebar; About stays reachable without scrolling the report. On phones the drawer fills the available viewport height with the same footer. Short viewports allow the navigation and references to scroll within their own areas. Settings contains Review schedule and Data coverage. The latter holds the session history timeline and app-specific Add export or Replace export disclosures. Overview and Habits & usage link to the timeline. When opened through these links, an arrow-only back link to the left of Data coverage restores the originating page, scroll position and link focus without resetting filters. Give the arrow an accessible name, “Back to previous view”. Hide the back link when Settings is opened directly. The sample controls update the preview summary. Generated reports direct users to the app that owns the schedule. At the bottom, on every page, a note (`#side-about`) always shows the method, and a folded "References" list sits under it, each item a link to its original source that opens in a new tab, in the note's muted color with an underline. The template's note also says it's a sample report. Both print after the report.
3. Overview (`#overview`): "Your latest review" as the `h1`, the summary paragraph (20px, plain words, no numbers), “What you use AI for” (weekly session counts stacked by kind of work for the last 13 complete weeks, from the report cube, with a link to Data coverage in Settings; under 600px the 13 bars fit the card and every third week keeps its date, ending on the latest), "Following up on your last review" (`#last-cycle`, one card per decision, one folded row per recommendation; only after a review with logged recommendations), then "Explore your report", one row per page.
4. Recommendations based on your AI sessions (`#part-2`): headline, then pattern cards
   (`article.icard`), each ending in its recommendation panel with Open in <app> and Decline.
5. Keep your skills current (`#part-3`): headline, scan line, "Skills to fix" (`#fix-first`, with skill fix panels in `section.try.skill-fix`: the recommendation panel without the saves line, with the same editable prompt), "Worth a look" (its other fixes and next steps as inline recommendations),
   collapsed "Skills you wrote", collapsed installed skills.
6. How your habits are changing (`#part-1`, last despite its id): the page title is the open question
   (“How your habits are changing” with scripts off), then `#trends`: the open group shows its summary (12px above and below),
   the filters and its charts (see "Chart groups"). Under the filters, hovering or focusing View data coverage opens a
   360px card, "Data coverage" over one plain line of which apps and weeks the charts count; Escape dismisses it,
   and the link goes to Data coverage in Settings. On the usage question's page, "5-hour limits in the last week" follows (see "5-hour limits").
   Then comes "Activity since your last review". `scripts/prerender.py` saves the drawn charts, bars and tables into
   the file and marks the section `data-static`, which hides the filters and shows a note.
   The script clears the mark, sets `data-live` and redraws with live filters. With neither
   mark (scripts off, nothing prerendered), the section shows one line, "Open this file in a
   browser to see the charts", and hides the empty filters and tables.

## Chart groups

Decided Oct 30, 2026 from three prototypes. The automation group was added Nov 1, 2026.

- Charts sit in five groups, one per question: "Am I explaining what I want?", "Am I checking
  the work?", "Am I handing off the right work?", "Am I automating repeat work?", "Where does my
  usage go?". One group shows at a time; the questions in the sidebar under Habits & usage switch it,
  and the page title becomes the open question (decided Nov 19, 2026, over answer cards, underline tabs
  and a picker in the title).
- A group whose charts have no data under the current filters is hidden (sidebar question and panel), and
  one muted line under the charts names it and gives the true reason: its charts need Claude
  Code or Codex, the Work filter leaves it out, or too few sessions. If every group is empty, all stay.
- The first group with data opens first. Inside a group, the charts going the wrong way
  come first, biggest slip first (measured in noise floors).
- The open group starts with one sentence of what changed, comparing the last 4 weeks with
  the 4 before, whatever the time filter. No label, no values. Changes under the noise floor
  (see SKILL.md "Trend metrics") read "about the same" and never sort first. "How each app's use is changing" uses the same two windows.
- Each chart is a card: title (with its card), definition line, the plot, then one clause for the
  direction the line moved ("Up: you typed more rules by hand."). It says what the measure did,
  never why. With the time filter on 4 weeks the earlier point is off the chart, so it reads "Up
  from the 4 weeks before: …". A flat chart has none. A chart with no line has only its reason.
- Time, App, Work and Project are always visible. App, Work and Project use single-select dropdowns, defaulting to All apps, All work and All projects. Project lists every saved project display label (project_label, falling back to the legacy name) by descending session count, followed by Unknown for missing and legacy project metadata. Canonical IDs are filter values, never the user-facing label. Matching names across verified local sources combine automatically; user grouping overrides take priority. Time uses a 142px dropdown with 4 weeks, 3 months, 6 months, 12 months and Custom range (From/To). Keep the controls, Clear and right-aligned session count in one desktop row where space permits. The button reads "Clear" (accessible name "Clear all filters"); the button inside the no-match message keeps "Clear filters" because it sits away from the filter row; View data coverage follows underneath. Phones keep Time/count together, then wrap App, Work, Project and Clear with 44px targets. Clear is disabled in the report default selection. Presets apply immediately; custom dates apply together only when valid. Dismissal discards drafts and restores focus. Keep app/work/project selections when time changes. Use the collector's nested daily totals for partial weeks; legacy weekly-only rows require complete weeks and an explanatory validation message. Never prorate weekly history.
- The time filter opens on the range the data covers: 3 months, 6 months or 12 months. All history shows every saved week; longer history still opens on 12 months.
- Every chart fills its card: the script sets the viewBox from the card's width and redraws when the page's width changes, so text and height stay the same.
- Each group opens by answering its question in plain words (`say` and `opens` in `GROUPS`), then names at most two changes from `READS` and says "The rest held steady." when that's true. It compares the last 4 weeks with the 4 before, and says "lately" for that. Metric names stay on the charts.
- The handing-off group pairs its one line chart with "What you handed off": static bars (`.brow`, no filter) sharing the card's rows.
- Any other group with an odd number of charts draws its first one full width, so the grid has no hole, from 744px, where two columns fit. Plots in a row
  share a top and a baseline; a single column keeps no blank rows for that. Chart markers always read "was" and "now".
- Each line is a 4-week running value (`ROLL` in the script). Its last point is the "last 4
  weeks" number and the point 4 weeks earlier is the "4 weeks before" number; both are marked
  with a dot and their value, so the sentence and the picture agree, even when that
  one week is a gap in the line. Each value label touches its own ring, in whichever spot has the least
  in its way, so it can't drift onto another part of the line. A flat chart prints "now" and one number. A rate with fewer than 5 sessions under it in a window leaves
  a gap, and the tooltip says too few sessions rather than none. Untested changes shipped has the same
  floor as Tested by the AI, because both count sessions with code changes.
- The Change column is worked out from the rounded cells beside it. A count under 10 keeps its
  decimal and shows the plain difference, never a percent. Any change needs 10 sessions in each
  window, in every chart and table, except Sessions per week.
- Named milestones are quiet solid hairlines from one common top. Unnamed ones are fainter and
  stop below the label row. The group's first chart names them all; the others name only the
  latest, and tooltips name any of them. Dashed lines and hatching mean only
  one thing: data Second Look can't see.
- Coverage is said once under the group summary ("These charts count Claude Code and Codex
  only.", or "Output checking counts all your apps. The others count only Claude Code and Codex."), in muted text, never yellow.
- "Am I automating repeat work?" ends with "What you could automate next" (`#automate-next`):
  one row per repeated request, most repeated first, with the request in quotes, the count in
  plain text ("6 times in 4 weeks") and the recommendation as an inline recommendation (see "Pattern card"). The script moves the block into
  that group. Delete it when there are no repeats.
- "Where does my usage go?" is followed by "5-hour limits in the last week" (`#limits`). See "5-hour limits".
- Without scripts (prerendered), every group shows in turn with its question as a heading.
- Phones: the questions sit in the sidebar drawer with the rest of the navigation.

Rejected: boxed question tiles above the summary (Nov 19, 2026: they took room above every chart, and the sidebar already says where you are); full-width charts drawn by scaling a fixed viewBox (the axis text doubles); a fixed set of three groups (empty groups hide instead). Earlier: a chip row with
one group at a time and a repeated question heading (the chips gave
no reason to pick one and showed nothing new on opening); every chart visible in work-stage
order with a jump bar (still a long scroll, and some charts fit more than one stage); counts
of slipping, improving and steady charts on the tiles, and the value and change on each chart
and summary row (too much to read before the first chart).

## 5-hour limits

Decided Nov 24, 2026. A section of its own with its own title and dates, because one week suits it and the review period suits the
tables below. No filters: the ones above don't change it, and a second set would compete with them. Its title is level with "Activity
since your last review", and the script draws it from `LIMITS` on the usage question's page only.

- One sentence answers first: how often each app's 5-hour limit filled up, and when if the hits share a day or part of the day.
- One card per app whose limit filled up that week: title, a heat map (7 days by 6 times), a legend, one line of what it
  shows. No definition lines (the author removed them Nov 24, 2026): the legend
  and the line under it say what the cells mean, and the table's label says it for screen readers. It's a real table with day and time headers. Each value is printed in its cell, and one pink scale mixes `--series` into
  `--surface-2` from 10% to 85%, so the text keeps 4.5:1 in both themes. Cells are 40px tall with 4px gaps.
- Claude Code cells are shares of its usage, shaded against the week's busiest cell; an ink tag, "Limit", marks a hit. Codex cells are
  how full the limit got, shaded against 100%; the tag is "Full". An empty Codex cell means no reading, which
  isn't proof Codex was unused, so the legend says "No Codex reading".
- Under them, one breakdown card per app (share bars), side by side where two fit, with a link to each recommendation that covers it.
- When a hit is saved but its logs are gone, the sentence still counts it and says the heat map isn't shown. Missing data never draws as 0%.
- A week when neither limit filled up is one sentence with no heat map. With no Claude Code or Codex, the section hides.
- Phones: the heat map scrolls sideways in its card, keeping the day labels in view; the keyboard can reach it.

Rejected: a filter for the section; one combined heat map (each app has its own limit); a 3-hit minimum (a week can have one hit worth
seeing); showing it on all five question pages.

## Pattern card

A number in a pink circle, the recommendation's number; title; one how-sure chip, then the apps as plain muted text on the same line, separated by commas ("Claude Code, Codex, claude.ai"), so the chip sits in the same place on every card; then a full-width, left-aligned `.ic-summary` paragraph, with no "What happens" label. Its two sentences explain the behavior in more detail than the title without restating it. A native `details.ic-evidence` row labelled "Evidence and why it matters" starts collapsed beneath the summary. Its top divider and chevron follow the existing folds; omit its bottom divider before the action panel. Inside, Evidence and Why it matters remain separate labelled groups with a divider between them. Keep supporting prompt quotes inside evidence. When a shared standing rule applies to at least two apps the person uses, add a separate collapsed `details.ic-rule-comparison` row immediately below evidence in `.ic-disclosures`. Use the same 44px minimum target and the divider between rows. Omit the comparison for one-app recommendations and findings without a shared rule. Its summary is a keyboard-operable target at least 44px tall, and printing includes the evidence and restores the reader's disclosure state afterward. Then the recommendation
in a pink panel (`section.try`): one sentence saying what the app will set up, one pink line saying what it saves, with its working in the same sentence or the next one at the same size and colour (`.try-saves`, the working in an unstyled `.saves-how` span), then the prompt in a collapsed "View prompt" fold with Copy in its corner. With scripts the prompt becomes an editable text box (`textarea.prompt-edit`, styled like `pre`) with a muted note under it: "You can edit this prompt before you copy or approve it.", or once changed "Edited. Copy and Approve use your version." with a Reset link. When an edit passes 1,800 characters on a panel that opens an app, the note turns `--fg` and says how many characters over it is and offers the paste fallback ("126 characters too long to open in Codex. Shorten it, or use Copy prompt and paste it into a new Codex session."), and the open button reads "Copy prompt" and copies without opening the app until the prompt is short enough again. Edits are kept in that browser; print shows the prompt as plain text. Then a status line (`.fix-status`, muted, hidden while empty) and the actions: "Open in <app>" (primary fill, the app from `data-app-name`, such as "Open in Codex") and Decline (outline), 36px tall, 44px on phones. States: approved shows "Sent to <app>…" and the open button reads "Open <app> again"; declined shows "You declined this." with Undo; `data-app="copy"` shows "Copy prompt" in place of the open button. Without scripts the actions stay hidden and the prompt stays read-only. Print opens the prompt and hides the actions. Keep one entry app per panel. For a shared rule, the prompt names the relevant destinations and scope, includes the exact rule, and asks for a verified outcome or a manual paste step for each app. Every prompt asks the app to show the change and wait for a yes. Preserve per-task
steps such as starting a fresh session, and disclose any inaccessible settings or unverified model switch
in the prompt. Folds inside cards all look the same: a row between hairlines with a chevron, pink on hover.

An inline recommendation (`section.try.try-inline`) is the same panel for a short recommendation inside a table row or list row: no pink fill, border or padding, and no saves line. It holds one line saying what to ask which app ("Ask Claude Code to reinstall your mermaid-diagrams skill."), the "View prompt" fold with no top divider, the editable prompt, the status line and the actions at 32px (44px on phones). Use it for every prompt in "Skills to fix", "Worth a look" and "What you could automate next" that doesn't get its own panel.

For rules saved instead of repeated, include both retyping and waiting for extra AI replies in the
saving. Give a minute estimate only when the durations are supported or the assumptions are stated;
otherwise name the benefit and say total time saved isn't measured.

## Recommendation review

"Following up on your last review" sits in cards that scale with the number of recommendations. Each decision is a `.last-group`: a plain-text pink header ("Keep doing these", "Try more" or "You can stop these"), without a heading icon, then one `details.last-fix` per recommendation. A closed row shows the recommendation's name and one short result ("Too soon to tell, 2 weeks in", "You used it more: 11% to 18%", "Not tried yet. Now only for long prototypes"); the sentence on what changed is in the fold. Name what a percentage measures and which apps it covers in the result or its expanded explanation. All recommendations start collapsed. Groups sit side by side and take the full row when alone.

## Habit terms

Habit names carry a dashed underline, quieter on chart titles
(`--term-quiet`). Hover or keyboard focus opens a card that says how the habit is counted. The
first "skills" in part 3's headline carries one too, and so do the first session, model, test, ship and skill in part 2's pattern cards, including terms inside their evidence disclosures. It's pure CSS, so it works in viewers that block scripts; the script only
keeps the card on screen and lets Escape close it.

```html
<span class="term" tabindex="0" aria-describedby="def-briefed">Briefed starts<span class="term-card" role="tooltip" id="def-briefed">…</span></span>
```

In prose, wrap the first
mention of each habit once inside a card body, and in "Activity since your
last review". Skip the summary and part headlines, and skip a term the sentence already defines. Wrap the words the sentence uses, even when they aren't the habit's name: "corrections",
"Claude misread you only six times", "start with a real brief". Metric column headers in tables carry a card too (`def-<habit>-tools`, `def-<habit>-work`). Skip other headings, table cells and
chart text (each chart carries a short definition line, and its title opens a card from `METRICS` in the template script). One card per habit per section, so a
paragraph never shows the same card twice. Ids are `def-<habit>-<section>`, for example
`def-corrections-rules`, and must be unique. Cards work inside `p`, `dd` and `th`.
Use these definitions word for word:

| Term | Definition |
|---|---|
| Briefed starts | Your first message gives at least two of three things: the goal, the background, and what done looks like. Example: “Add a pricing table for freelancers. Match the current cards. Done when it fits on a phone screen.” |
| Corrections | Messages that fix a misunderstanding, like “no, I meant…” or “that’s not what I asked”. Counted per 10 messages you send, so busy and quiet weeks compare fairly. |
| Restarts | A new session that opens with mostly the same request as one from the last two days, in the same app. It usually means the first try went off track. |
| Rules retyped per week | A rule typed by hand, like “use tables” or “no filler”. If you type it more than once, it belongs in the saved instructions of every app you use. |
| Long-session share | Share of your usage from very long sessions, about a novel’s worth of text or more. Each message there makes the AI re-read the whole session first, so they use up your limit fastest. Starting fresh between tasks lowers it. Claude Code and Codex only. |
| Session | An exchange with an AI, from your first message until you start a new session. |
| Model | The version of the AI you’re talking to. Stronger ones use up your limit faster. |
| Test | A check that the code really works, run by the AI or by you. |
| Ship | Put it where other people can use it. |
| Skill | A skill is a saved set of steps the AI follows the same way each time. |

Chart titles carry their own cards, in `METRICS` in the template script.

## Chip labels (and nothing else)

- How sure, for patterns, recommendations and skill findings alike: Sure · Likely · Hunch. Each opens a
  one-line meaning on hover or tap.
- State pills: Stale · Review · Minor · Current · Behind · Broken · Duplicate · Not checked ·
  High · Medium · Low
- Chip weights: Sure, Likely and Hunch share one neutral fill (`--surface-2`, `--fg` text); the word says how sure. Stale, Broken and High are red outlines.
- Chip size: 20px tall, 12px text, 8px side padding, the text centred by a flex box with a 1em line height.

## Removed on purpose (don't bring back)

Numerals before part titles · goals box and "Personalize goals" · slot labels (Change now,
Practice, Explore) · "How sure" rows in cards · "How we know this" · "How we'll know it
worked" · Expand all / Collapse all · "sample data" chips · bullet dots in chips · divider
lines between cards inside a part (dividers only between major sections) · "Review N" line
above the summary · the at-a-glance table and the "Start here" line (the summary does that job) · thesis and "Three moves" summary · the "More metrics"
dropdown · the value and change line in chart headers · "Compare the fixes" and the separate
"What the <date> review will check" fold · app
pills · uppercase labels · the "What your charts say" label · group-tile
blurbs · the header tagline · impact pills in "Skills to fix" · the "Your plan until <date>" panel (each recommendation lives in its Try block) · "Try next" (a feature worth trying is a recommendation) · section taglines that restate a heading · a "How sure" column whose rows all match ·
pink side stripes on panels · filled table headers · Keep, Revise and Drop pills (a bare "Keep" didn't say what to keep; group headers do) · diffs in skill fixes · "Start with the X
chart" · "Higher: … Lower: …" under charts · the word "cycle" · "What each trend covers" (now
inside Settings → Data coverage) · the "Habits over the last year" heading.

Use dividers between expandable rows and list or table rows. Omit the divider after the final row. Keep the enclosing border when the list sits inside a bordered container.

## Chart palette and data access

Use as few colors as the information needs, within one chart and across a chart group. Labeled bars in separate rows, such as “What you used AI for,” and independently labeled single-series charts use pink first (`--chart-pink`, `#e6308a`). The shared `--series` token is `--chart-pink` in the dark theme and `#D1416B` in the light theme. Habit trends, category/app share bars, helper-agent breakdowns and coverage marks all use it. Row labels, chart titles and values identify what each mark represents; no category legend is needed for these independent marks.

Use more hues only when overlapping or stacked categories need differentiation, with clear legends or direct series labels. Overview's stacked activity chart keeps its stable category mapping: coding orange, design green, writing bright orange, research light blue, planning blue, advice deep blue, and other lime. Filtering or missing categories never shifts those assignments, and its legend uses the same mapping.

The available `--chart-*` palette is orange `#c44601`, bright orange `#f57600`, light blue `#8babf1`, blue `#0073e6`, deep blue `#054fb9`, green `#5ba300`, lime `#89ce00`, pink `#e6308a` and deep pink `#b51963`. Use only the colors that serve a differentiation purpose. They are chart fills, not status grades or replacement brand colors. Use solid fills with the original chart shapes and spacing. Do not add outlines, hatch patterns, shadows or line underlays to the marks. Coverage retains its neutral unavailable-history treatment and a matching pink Data legend.

Overview stacked activity charts show a compact tooltip on hover, keyboard focus or tap: week, total sessions, and directly labeled category counts. Use the existing neutral surface, text, border and radius tokens; no extra category colors are needed in the tooltip. Keep it within the viewport, allow hovering over it, dismiss with Escape or an outside tap, and toggle it with tap or Enter/Space. Overview has no **View chart data** disclosure. Its equivalent table remains visually hidden for screen readers and becomes visible in print. Across all chart types and screens, do not add a persistent **View chart data** link or disclosure by default. Add separate data access only when a clear user need calls for it; keep essential values accessible through direct labels, accessible tooltips or equivalent screen-reader data. All tables have captions and row and column headers; disclosed tables retain keyboard access and their own horizontal scroll area. Missing data remains missing; do not turn it into zero. `scripts/prerender.py` preserves these tables and the activity chart in script-blocked reports.

The colors are not independently certified for every pairing: essential graphical boundaries need 3:1, ordinary text 4.5:1, and category identity must have a non-color cue. Solid fills do not meet every surface or adjacency threshold. Keep the readable data-table alternative: it conveys the same categories, dates and values without requiring the graph or its colors to be distinguished. This does not mean the fills universally reach 3:1. Run `scripts/check_chart_palette.py` and verify the rendered light/dark, narrow and filtered states before changing the palette.

## Conditional report states

The default sample keeps its supported summary, activity chart and all three Overview
destinations after an export update. A new snapshot recomputes them; it omits duplicate import
confirmation. The skills destination is not replaced with coverage.

Verified absence of saved skills sets `#part-3[data-skills-state="none"]` and uses the built-in
`.skills-empty` component: explanation, optional relevant repeat-work link, three benefits,
Explore skills (skills.sh and Anthropic skills), then one optional authoring guide. Resource
rows reuse `.dests` / `.dest`, have dividers between rows and an enclosing border. The benefit
reads “Reuse across AI apps”; setup and support vary by app. Delete sample skill results
and replace the scope line with measured facts. Not-included and unreadable skill
files use their own honest copy, without claiming verified absence.

`#part-2[data-findings-state="none"]` uses `.briefs-empty` for adequate evidence with no
recommendation; remove sample cards. Sparse evidence gets a scope-specific limit,
not a claim that everything is good. No session evidence produces an assistant preflight,
before a saved findings report. Only offer a skills check when readable saved skill files exist.
Keep examples separate. Rich permission and parse diagnostics remain deferred pending measured
collector support. Latest included session dates come from parsed records; a file timestamp
never establishes source coverage. Filtered-empty states retain the active controls and a
reset, and do not become report-wide absence claims.
