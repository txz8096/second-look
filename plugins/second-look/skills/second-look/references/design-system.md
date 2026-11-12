# second look report design system

The source of truth is `report-template.html` (a filled-in sample report).
Build every report from a copy of it. Keep its doctype and `<html lang>` lines, charset and viewport lines, `<style>` block, font links, logo and scripts
exactly as they are. Without the viewport line, phones render the page at desktop width and shrink the text. Change only the text, the table rows, the cards and the data values at the top of the trends script (`END`, `CUBE`, `SCOPE`, `MILESTONES`).
`scripts/check_report.py` also fails a report whose text uses a banned word, that still has the template's sample data, whose script has a syntax error, whose `END` doesn't match its cube or is the week in progress, whose cube repeats a row, whose summary quotes a metric or has term cards, or whose cube or scope has a source id the script doesn't know. Names and quotes from their own sessions are left out of the word check.
`scripts/check_report.py` fails any report whose styles differ from the template.
The `<style>` block is one layer, written in page order. Change a rule where it lives; don't
append overrides at the end.

## Tokens

The values below are the dark theme, which is the default. The app bar's switch sets `data-mode="light"` on `<html>`, and `:root[data-mode="light"]` in the template overrides the tokens with shadcn's light neutrals and a darker pink for text (`--accent` `#B02A55`, `--series` `#e6308a`). `--accent-fill` stays Proof Pink in both, for the logo's underline. Components use tokens only, so a new color goes in both blocks. The choice is saved in `localStorage` as `second-look-theme`.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0A0A0A` | Page background |
| `--surface` / `--surface-2` | `#171717` / `#262626` | Cards, buttons, menus / neutral fills, tracks |
| `--fg` | `#FAFAFA` | Text |
| `--primary` / `--on-primary` | `#E5E5E5` / `#171717` | The firmest chip (Sure) |
| `--muted` / `--faint` | `#A1A1A1` / `#8A8A8A` | Secondary text, labels |
| `--term-quiet` | `#737373` | Dashed underline on chart titles, Hunch chip outline |
| `--line` / `--line-strong` | white at 10% / 15% | Dividers, borders |
| `--accent` | `#F2A7B8` (Proof Pink) | Links and action highlights |
| `--accent-soft` / `--accent-soft-2` | pink at 8% / 28% | Pink panels and their borders |
| `--on-accent` | `#0A0A0A` | Text on pink fills |
| `--p1` | `#FF6568` | A broken or stale skill, high risk. States only |

The neutrals are shadcn/ui's dark theme, written as plain CSS: the report stays one file, so it uses the look and none of the React components. The one status colour (`--p1`) marks states, such as a broken skill. Never use it to grade the user's habits:
changes in their numbers are plain text, and "best" cells are pink, never green or red.
Pink marks the things to act on: "Try this" panels, the plan, the fix-review group headers, the chosen tile and action counts. Independent chart series and labeled bar rows use pink; stacked categories use the palette below.

**The signature.** Neutral cards with hairline borders hold the findings, charts, panels and tables; headers are never filled. The fix in each pattern is a pink panel with a pink hairline, the same as the plan. No side stripes on panels.

## Type

Familjen Grotesk for everything; IBM Plex Mono for code and quoted prompts. Headings 700, letter-spacing
-0.025em.

| Role | Size |
|---|---|
| Part title (`.part-head h2`) | 32px |
| Plan title | 24px |
| Summary, section headings | 20px |
| Pattern title | 18px |
| Part headline, "Try this" title, chart and panel titles, chart group summary | 16px |
| Card text, tables, plan rows, tabs, notes | 14px |
| Labels (sentence case, weight 500, muted), code, small notes | 13px |
| Chips | 12px |

Running text, tables, charts and code blocks all use the full column. Pasted text and the automation counts are set in IBM Plex Mono; a quoted prompt sits on a neutral rule beside what came of it.

No uppercase labels. On phones (680px and narrower) the template raises the floor: small text 14px, card body 16px, chart axis text 12px, and buttons, chips and
section toggles at least 44px tall, and Copy sits in the block's left corner, clear of the
contents button. Under 600px, the script turns each table row into a small
card (the first cell leads, a lone chip or pill takes the corner, the rest read "label  value",
aligned for numbers and run in for part 3's words; a table with the `unlabeled` class, like the model table, drops the labels), so nothing scrolls sideways; `prerender.py`
saves those rows, and without either, tables scroll. Without scripts, Copy buttons stay hidden. Charts that didn't move wait behind one
"Show N more charts" button. The template's styles already do this, so a report gets it by keeping
them.

## Radii

6px tooltips and the chosen filter · 8px buttons, inputs, tiles, code blocks and the filter track · 10px "Try this" panels · 14px cards, tables, the plan and the report menu ·
fully rounded chips.

## Page structure, in order

An app bar, a sidebar and one page at a time, from the "Compact App Bar" designs (Nov 6, 2026). Scripts off, every page shows in turn and the links still work.

1. App bar (64px, stays on screen): the sidebar toggle and logo on the left; the report menu (`#report-menu`, a `details` that works with scripts off) the Feedback link (`#report-issue`, to https://github.com/txz8096/second-look/issues/new) and the light and dark switch (`#theme-btn`, hidden with scripts off) on the right. The menu shows "Latest report" or "Earlier report" with this report's date, and opens a scrolling list of every saved report, newest first, with the latest marked. `scripts/report_menu.py` writes the list between the `report-menu` comments, using relative links, and switching reports stays on the same page. With one report, or on claude.ai, it's a plain label. Phones show only the date, and at 400px and narrower the year drops too, so the bar fits. The sample report's earlier dates are plain text, since it has no other reports to open.
2. Sidebar (`#side`, 256px; a drawer at 900px and narrower): Overview, Briefs & setup, Skills, Habits & usage, with no numerical counts or badges. On desktop it stays pinned below the app bar and fills the available viewport height, with method, Guidance and references, and About at the viewport bottom. Long references scroll inside the sidebar; About stays reachable without scrolling the report. On phones the drawer fills the available viewport height with the same footer. Short viewports allow the navigation and references to scroll within their own areas. Settings contains Review schedule and Data coverage. The latter holds the session history timeline and app-specific Add export or Replace export disclosures. Habits & usage links to the timeline. The sample controls update the preview summary. Generated reports direct users to the app that owns the schedule. At the bottom, on every page, a note (`#side-about`) always shows the method, and a folded "Guidance and references" list sits under it. The template's note also says it's a sample report. Both print after the report.
3. Overview (`#overview`): "Your latest review" as the `h1`, the summary paragraph (20px, plain words, no numbers), "Did the
   fixes from your last review work?" (`#last-cycle`, one card per decision, one folded row per fix; only after a review with logged fixes), then "Explore your report", one row per page.
4. How you brief AI and set up your apps (`#part-2`): headline linking to the plan, pattern cards
   (`article.icard`), then "Your plan until <date>" (`#plan`): one numbered row per fix with
   its name, time, what it saves, and what the next review checks, one line each from 681px with
   each value under its header, then a line linking the other skill fixes and the repeats to automate.
5. Keep your skills current (`#part-3`): headline, scan line, "Skills to fix" (`#fix-first`, with paste-to-your-AI blocks in `.fix-block`), "Worth a look",
   collapsed "Skills you wrote", collapsed installed skills.
6. How your habits are changing (`#part-1`, last despite its id): data-scope line, `#trends`: five question
   tiles; the open group shows its summary, the filters and its charts (see "Chart groups"),
   then "Activity since your last review". `scripts/prerender.py` saves the drawn charts, bars and tables into
   the file and marks the section `data-static`, which hides the filters and shows a note.
   The script clears the mark, sets `data-live` and redraws with live filters. With neither
   mark (scripts off, nothing prerendered), the section shows one line, "Open this file in a
   browser to see the charts", and hides the empty filters, tabs and tables.

## Chart groups

Decided Oct 30, 2026 from three prototypes. The automation group was added Nov 1, 2026.

- Charts sit in five groups, one per question: "Am I explaining what I want?", "Am I checking
  the work?", "Am I handing off the right work?", "Am I automating repeat work?", "Where does my
  usage go?". One group shows at a time; the tabs switch it. The tabs are boxed cards, five
  across from 681px: the question only, with a pink border and tint on the open one.
- A group whose charts have no data under the current filters is hidden (tab and panel), and
  one muted line under the charts names it and gives the true reason: its charts need Claude
  Code or Codex, the Work filter leaves it out, or too few sessions. If every group is empty, all stay.
- The group with the most charts going the wrong way opens first. Inside a group, those charts
  come first, biggest slip first (measured in noise floors).
- The open group starts with one sentence of what changed, comparing the last 4 weeks with
  the 4 before, whatever the time filter. No label, no values. Changes under the noise floor
  (see SKILL.md "Trend metrics") read "about the same" and never sort first. "How each app's use is changing" uses the same two windows.
- Each chart is a card: title (with its card), definition line, the plot, then one clause for the
  direction the line moved ("Up: you typed more rules by hand."). It says what the measure did,
  never why. With the time filter on 4 weeks the earlier point is off the chart, so it reads "Up
  from the 4 weeks before: …". A flat chart has none. A chart with no line has only its reason.
- Time, App and Work are always on show: Time, the session count and the View data coverage link on the first row, App and Work on the next. The first question card with data opens first.
- The time filter opens on the range the data covers: 3 months, 6 months or 12 months.
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
  one thing: data second look can't see.
- Coverage is said once under the group summary ("These charts count Claude Code and Codex
  only.", or "Output checking counts all your apps. The others count only Claude Code and Codex."), in muted text, never yellow.
- "Am I automating repeat work?" ends with "What you could automate next" (`#automate-next`):
  one row per repeated request, most repeated first, with the request in quotes, the count in
  plain text ("6 times in 4 weeks") and the fix as one line to paste. The script moves the block into
  that group. Delete it when there are no repeats.
- Without scripts (prerendered), every group shows in turn with its question as a heading.
- Phones: tabs in two columns; an odd last tab spans the row. The open tab's rule sits tight on
  its own label, so it can't read as an underline on the tab above.

Rejected: full-width charts drawn by scaling a fixed viewBox (the axis text doubles); a fixed set of three groups (empty groups hide instead). Earlier: a chip row with
one group at a time and a repeated question heading (the chips gave
no reason to pick one and showed nothing new on opening); every chart visible in work-stage
order with a jump bar (still a long scroll, and some charts fit more than one stage); counts
of slipping, improving and steady charts on the tiles, and the value and change on each chart
and summary row (too much to read before the first chart).

## Pattern card

A number in a pink circle, matching the fix's row in the plan; title; the apps as plain muted text and one how-sure chip; What happens, Evidence and Why it matters as labelled rows; their own prompt, when
there is one; an optional fold ("Which apps have which rules"); then the "Try this" block
in a pink panel: "Try this: <fix name>", one pink line saying what it saves (`.try-saves`) with its working in a muted line under it (`.saves-how`), the action in plain steps, a paste-ready block with
Copy in its corner. Folds inside cards all look the same: a row between hairlines with a chevron, pink on hover.

## Fix review

"Did the fixes from your last review work?" sits in cards that scale with the number of fixes. Each decision is a `.last-group`: a pink header with its icon (Lucide `check` for "Keep doing these", `pencil` for "Changed since your last review", `x` for "Stopped"), then one `details.last-fix` per fix. A closed row shows the fix's name and one short result; the sentence on what changed is in the fold. All fixes start collapsed. Groups sit side by side and take the full row when alone.

## Habit terms

Habit names carry a dashed underline, quieter on chart titles
(`--term-quiet`). Hover or keyboard focus opens a card that says how the habit is counted. The
first "skills" in part 3's headline carries one too, and so do the first session, model, test, ship and skill in part 2's pattern cards. It's pure CSS, so it works in viewers that block scripts; the script only
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
| Briefed starts | Your first message gives at least two of three things: the goal, the background, and what done looks like. Example: “Add a pricing table for freelancers. Match the current cards. Done when it fits on a phone screen.” Sessions that open on review comments aren’t counted. |
| Corrections | Messages that fix a misunderstanding, like “no, I meant…” or “that’s not what I asked”. Counted per 10 messages you send, so busy and quiet weeks compare fairly. |
| Restarts | A new session that opens with mostly the same request as one from the last two days, in the same app. It usually means the first try went off track. |
| Rules retyped per week | A rule typed by hand, like “use tables” or “no filler”. If you type it more than once, it belongs in the saved instructions of every app you use. |
| Long-session share | Share of your usage from very long sessions, about a novel’s worth of text or more. Each message there makes the AI re-read the whole session first, so they use up your limit fastest. Starting fresh between tasks lowers it. Claude Code and Codex only. |
| Session | One conversation with an AI, from your first message until you start a new one. |
| Model | The version of the AI you’re talking to. Stronger ones use up your limit faster. |
| Test | A check that the code really works, run by the AI or by you. |
| Ship | Put it where other people can use it. |
| Skill | A skill is a saved set of steps the AI follows the same way each time. |

Chart titles carry their own cards, in `METRICS` in the template script.

## Chip labels (and nothing else)

- How sure, for patterns, fixes and skill findings alike: Sure · Likely · Hunch. Each opens a
  one-line meaning on hover or tap.
- State pills: Stale · Review · Minor · Current · Behind · Broken · Duplicate · Not checked ·
  High · Medium · Low
- Chip weights: Sure is filled, Likely is neutral, Hunch is outlined. Stale, Broken and High are red outlines.
- Chip size: 18px tall, 12px text, with the text box trimmed to the capitals so they sit centred.

## Removed on purpose (don't bring back)

Numerals before part titles · goals box and "Personalize goals" · slot labels (Change now,
Practice, Explore) · "How sure" rows in cards · "How we know this" · "How we'll know it
worked" · Expand all / Collapse all · "sample data" chips · bullet dots in chips · divider
lines between cards inside a part (dividers only between major sections) · "Review N" line
above the summary · the at-a-glance table and the "Start here" line (the summary and plan do that job) · thesis and "Three moves" summary · the "More metrics"
dropdown · the value and change line in chart headers · "Compare the fixes" and the separate
"What the <date> review will check" fold (both live in the plan rows) · app
pills · uppercase labels · the "What your charts say" label · group-tile
blurbs · the header tagline · impact pills in "Skills to fix" · how-sure chips in the plan · "Try next" (a feature worth trying is a fix) · section taglines that restate a heading · a "How sure" column whose rows all match ·
pink side stripes on panels · filled table headers · Keep, Revise and Drop pills (a bare "Keep" didn't say what to keep; group headers do) · diffs in skill fixes · "Start with the X
chart" · "Higher: … Lower: …" under charts · the word "cycle" · "What each trend covers" (now
inside Settings → Data coverage) · the "Habits over the last year" heading.

Use dividers between expandable rows and list or table rows. Omit the divider after the final row. Keep the enclosing border when the list sits inside a bordered container.

On Overview, keep “What you use AI for”. It stacks weekly session counts by kind of work for the last 13 complete weeks using the report cube. Keep its link to Data coverage in Settings.

## Chart palette and data access

Use as few colors as the information needs, within one chart and across a chart group. Labeled bars in separate rows, such as “What you used AI for,” and independently labeled single-series charts use pink first (`--chart-pink`, `#e6308a`). The shared `--series` token is pink in both themes. Habit trends, category/app share bars, helper-agent breakdowns and coverage marks all use it. Row labels, chart titles and values identify what each mark represents; no category legend is needed for these independent marks.

Use more hues only when overlapping or stacked categories need differentiation, with clear legends or direct series labels. Overview's stacked activity chart keeps its stable category mapping: prototyping orange, creating bright orange, research light blue, brainstorming blue, career green, consultation deep blue, and other lime. Filtering or missing categories never shifts those assignments, and its legend uses the same mapping.

The available `--chart-*` palette is orange `#c44601`, bright orange `#f57600`, light blue `#8babf1`, blue `#0073e6`, deep blue `#054fb9`, green `#5ba300`, lime `#89ce00`, pink `#e6308a` and deep pink `#b51963`. Use only the colors that serve a differentiation purpose. They are chart fills, not status grades or replacement brand colors. Use solid fills with the original chart shapes and spacing. Do not add outlines, hatch patterns, shadows or line underlays to the marks. Coverage retains its neutral unavailable-history treatment and a matching pink Data legend.

Overview stacked activity charts show a compact tooltip on hover, keyboard focus or tap: week, total sessions, and directly labeled category counts. Use the existing neutral surface, text, border and radius tokens; no extra category colors are needed in the tooltip. Keep it within the viewport, allow hovering over it, dismiss with Escape or an outside tap, and toggle it with tap or Enter/Space. Overview has no **View chart data** disclosure. Its equivalent table remains visually hidden for screen readers and becomes visible in print. Trend cards retain their native **View chart data** disclosures. All tables have captions and row and column headers; disclosed tables retain keyboard access and their own horizontal scroll area. Missing data remains missing; do not turn it into zero. `scripts/prerender.py` preserves these tables and the activity chart in script-blocked reports.

The colors are not independently certified for every pairing: essential graphical boundaries need 3:1, ordinary text 4.5:1, and category identity must have a non-color cue. Solid fills do not meet every surface or adjacency threshold. Keep the readable data-table alternative: it conveys the same categories, dates and values without requiring the graph or its colors to be distinguished. This does not mean the fills universally reach 3:1. Run `scripts/check_chart_palette.py` and verify the rendered light/dark, narrow and filtered states before changing the palette.
