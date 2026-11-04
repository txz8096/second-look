# second look report design system

The source of truth is `report-template.html` (a filled-in sample report).
Build every report from a copy of it. Keep its doctype and `<html lang>` lines, charset and viewport lines, `<style>` block, font links, logo and scripts
exactly as they are. Without the viewport line, phones render the page at desktop width and shrink the text. Change only the text, the table rows, the cards and the data values at the top of the trends script (`END`, `CUBE`, `SCOPE`, `MILESTONES`).
`scripts/check_report.py` also fails a report whose glance disagrees with its cube, whose text uses a banned word, that still has the template's sample data, whose script has a syntax error, whose `END` doesn't match its cube or is the week in progress, whose cube repeats a row, whose summary says "a year ago" with no date, or whose cube or scope has a source id the script doesn't know. Names and quotes from their own sessions are left out of the word check.
`scripts/check_report.py` fails any report whose styles differ from the template.
The `<style>` block is one layer, written in page order. Change a rule where it lives; don't
append overrides at the end.

## Tokens (dark only)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#16181D` | Page background |
| `--surface` / `--surface-2` | `#1C1F25` / `#22252C` | Buttons, menus, hover fills |
| `--fg` | `#F2F3F5` | Text |
| `--muted` / `--faint` | `#A8ADB7` / `#7C828D` | Secondary text, labels |
| `--term-quiet` | `#676C76` | Dashed underline on glance labels and chart titles (3.4:1) |
| `--line` / `--line-strong` | `#2B2F37` / `#3A3F49` | Dividers, borders |
| `--accent` | `#F2A7B8` (Proof Pink) | Links, highlights, chart series |
| `--on-accent` | `#16181D` | Text on pink fills |
| `--p1` / `--p2` / `--good` | danger / warning / success | States only |

There is no light theme. Status colours (danger, warning, success) mark states, such as a
broken skill, a stale skill or a fix that was kept. Never use them to grade the user's habits:
changes in their numbers are plain text, and "best" cells are pink, never green or red.
Pink fills one surface only: the plan.

**The signature.** Two things repeat down the page, both taken from the logo. Hairline ledger rows
carry every table and list: no filled headers, no outer box, rows that run to the column's edges.
The logo's double rule marks one thing: a double underline under a glance change that moved.
The fix in each pattern is a filled pink panel, the same as the plan. No side stripes.

## Type

Familjen Grotesk for everything; IBM Plex Mono for code and quoted prompts. Headings 700, letter-spacing
-0.025em.

| Role | Size |
|---|---|
| Part title (`.part-head h2`) | 48px |
| Plan title | 32px |
| Pattern title, glance values | 24px |
| Lead sentence, summary, part headline, "Try this" title, section and glance headings | 20px |
| Body, chart and panel titles, plan rows, tabs | 16px |
| Small text, tables, notes | 14px |
| Labels (sentence case, weight 500, muted), chips | 13px |

Running text, tables, charts and code blocks all use the full column. Quoted prompts are set in
IBM Plex Mono, as typed.

No uppercase labels. On phones (680px and narrower) the template raises the floor: small text 14px, card body 16px, chart axis text 12px, and buttons, chips and
section toggles at least 44px tall, and Copy sits in the block's left corner, clear of the
contents button. Under 600px, the script turns each table row into a small
card (the first cell leads, a lone chip or pill takes the corner, the rest read "label  value",
aligned for numbers and run in for part 3's words), so nothing scrolls sideways; `prerender.py`
saves those rows, and without either, tables scroll. Without scripts, Copy buttons stay hidden. Charts that didn't move wait behind one
"Show N more charts" button. The template's styles already do this, so a report gets it by keeping
them.

## Radii

6px code blocks and tooltips · 8px buttons and inputs · 12px the plan and the contents menu ·
fully rounded chips and filters. Tables, charts, bar panels, the glance and "What you could
automate next" have no box.

## Page structure, in order

1. Header: the second look logo, then the tagline "Learn from the way you work with AI" in
   16px body text, with the review's date on the right.
2. Summary paragraph (20px), then one "Start here" line (`#start-here`) linking to plan row 1 and
   the plan.
3. Last 4 weeks at a glance (`#glance`): heading, "<last 4 weeks> vs <the 4 before>", then an open
   ledger of six rows (name, value, change, meaning) divided by hairlines, no box. Same numbers as
   the chart table. A row past the noise floor, in either direction, is `.stat.moved`. A scoped or
   sampled review names its scope in this heading instead.
4. Improve your prompts and setup (`#part-2`): headline linking to the plan, "Did the
   fixes from your last review work?" (`#last-cycle`, one line per fix with its Keep/Revise/Drop
   pill; only after a review with logged fixes), pattern cards
   (`article.icard`), then "Your plan until <date>" (`#plan`): one numbered row per fix with
   its name, time, what the next review checks and how-sure chip, one line each from 681px with
   each value under its header, then a line linking the other skill fixes and the repeats to automate.
5. Keep your skills current (`#part-3`): headline, scan line, "Fix first" (`#fix-first`, with paste-to-your-AI blocks in `.fix-block`), "Worth a look",
   collapsed "Skills you wrote", collapsed installed skills.
6. How your habits are changing (`#part-1`, last despite its id): data-scope line, `#trends`: filters,
   then five question tiles; the open group shows its summary and charts (see "Chart groups"),
   then "Usage since your last review". `scripts/prerender.py` saves the drawn charts, bars and tables into
   the file and marks the section `data-static`, which hides the filters and shows a note.
   The script clears the mark, sets `data-live` and redraws with live filters. With neither
   mark (scripts off, nothing prerendered), the section shows one line, "Open this file in a
   browser to see the charts", and hides the empty filters, tabs and tables.
7. Report an issue (`#report-issue`): one muted line above the footer, linking to
   https://github.com/txz8096/second-look/issues/new. Keep it as the template has it.
8. Footer: method and sources.
9. Floating contents menu (`#toc`) bottom right, listing the glance, the three parts and
   Report an issue. It opens on hover and keyboard focus with CSS alone, so it works in
   viewers that block scripts; the script adds click, Escape and the current-section highlight.
   It also lists the plan.

## Chart groups

Decided Oct 30, 2026 from three prototypes. The automation group was added Nov 1, 2026.

- Charts sit in five groups, one per question: "Am I explaining what I want?", "Am I checking
  the work?", "Am I handing off big searches?", "Am I automating repeat work?", "Where does my
  usage go?". One group shows at a time; the tabs switch it. The tabs are boxed cards, five
  across from 681px: the question only, with a pink border and tint on the open one.
- A group whose charts have no data under the current filters is hidden (tab and panel), and
  one muted line under the charts names it and gives the true reason: its charts need Claude
  Code or Codex, the Work filter leaves it out, or too few sessions. If every group is empty, all stay.
- The group with the most charts going the wrong way opens first. Inside a group, those charts
  come first, biggest slip first (measured in noise floors).
- The open group starts with one sentence of what changed, comparing the last 4 weeks with
  the 4 before, whatever the time filter. No label, no values. Changes under the noise floor
  (see SKILL.md "Trend metrics") read "about the same" and never sort first. The glance and
  "How each tool's use is changing" use the same two windows.
- Charts have no box: title (with its card), definition line, the plot, then one clause for the
  direction the line moved ("Up: you typed more rules by hand."). It says what the measure did,
  never why. With the time filter on 4 weeks the earlier point is off the chart, so it reads "Up
  from the 4 weeks before: …". A flat chart has none. A chart with no line has only its reason.
- The time filter opens on the range the data covers: 3 months, 6 months or 12 months.
- A group with an odd number of charts draws its first one full width (a wider viewBox, so the text
  stays the same size), so the grid has no hole, from 744px, where two columns fit. Plots in a row
  share a top and a baseline; a single column keeps no blank rows for that. The group's first chart
  labels its markers "was" and "now", and drops the word when there's no room.
- Each line is a 4-week running value (`ROLL` in the script). Its last point is the "last 4
  weeks" number and the point 4 weeks earlier is the "4 weeks before" number; both are marked
  with a dot and their value, so the sentence, the table and the picture agree, even when that
  one week is a gap in the line. Each value label takes the first spot clear of the line, and a
  flat chart prints one number. A rate with fewer than 5 sessions under it in a window leaves
  a gap, and the tooltip says too few sessions rather than none.
- The Change column is worked out from the rounded cells beside it. A count under 10 keeps its
  decimal and shows the plain difference, never a percent. Any change needs 10 sessions in each
  window, in every chart and table, except Sessions per week.
- Named milestones are quiet solid hairlines from one common top. Unnamed ones are fainter and
  stop below the label row. The group's first chart names them all; the others name only the
  latest, and tooltips name any of them. Dashed lines and hatching mean only
  one thing: data second look can't see.
- Coverage is said once under the group summary ("These charts count Claude Code and Codex
  only."), in muted text, never yellow.
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

A number in a pink circle, matching the fix's row in the plan; title; the tools as plain muted text and one how-sure chip; What happens, as the lead sentence;
Evidence and Why it matters in two uneven columns (3:2, Why muted); their own prompt in mono, when
there is one; an optional quiet fold ("Which tools have which rules"); then the "Try this" block
in a filled pink panel: "Try this: <fix name>", the action in plain steps, a paste-ready block with
Copy in its corner. Folds inside cards all look the same: muted text and a chevron, pink on hover.

## Habit terms

Habit names carry a dashed underline, quieter on glance labels and chart titles
(`--term-quiet`). Hover or keyboard focus opens a card that says how the habit is counted. The
first "skills" in part 3's headline carries one too. It's pure CSS, so it works in viewers that block scripts; the script only
keeps the card on screen and lets Escape close it.

```html
<span class="term" tabindex="0" aria-describedby="def-briefed">Briefed starts<span class="term-card" role="tooltip" id="def-briefed">…</span></span>
```

Every glance stat except Sessions keeps its card from the template. In prose, wrap the first
mention of each habit once in the summary and once inside a card body, and in "Usage since your
last review". Skip part headlines, and skip a term the sentence already defines. Wrap the words the sentence uses, even when they aren't the habit's name: "corrections",
"Claude misread you only six times", "start with a real brief". Skip headings, table cells and
chart text (each chart carries a short definition line, and its title opens a card from `METRICS` in the template script). One card per habit per section, so a
paragraph never shows the same card twice. Ids are `def-<habit>-<section>`, for example
`def-corrections-summary`, and must be unique. Cards work inside `p` and `dd`.
Use these definitions word for word:

| Term | Definition |
|---|---|
| Briefed starts | Your first message gives at least two of three things: the goal, the background, and what done looks like. Example: “Add a pricing table for freelancers. Match the current cards. Done when it fits on a phone screen.” Sessions that open on review comments aren’t counted. |
| Corrections | Messages that fix a misunderstanding, like “no, I meant…” or “that’s not what I asked”. Counted per 10 messages you send, so busy and quiet weeks compare fairly. |
| Restarts | A new session that opens with mostly the same request as one from the last two days, in the same tool. It usually means the first try went off track. |
| Rules retyped per week | A rule typed by hand, like “use tables” or “no filler”. If you type it more than once, it belongs in the saved instructions of every tool you use. |
| Long-session share | Share of your usage from very long sessions, about a novel’s worth of text or more. Each message there makes the AI re-read the whole session first, so they use up your limit fastest. Starting fresh between tasks lowers it. Claude Code and Codex only. |

Chart titles carry their own cards, in `METRICS` in the template script.

## Chip labels (and nothing else)

- How sure, for patterns, fixes and skill findings alike: Sure · Likely · Hunch. Each opens a
  one-line meaning on hover or tap.
- State pills: Stale · Review · Minor · Current · Behind · Broken · Duplicate · Not checked ·
  High · Medium · Low · Keep · Revise · Drop
- In "Did the fixes from your last review work?", each line opens with a decision pill.

## Removed on purpose (don't bring back)

Numerals before part titles · goals box and "Personalize goals" · slot labels (Change now,
Practice, Explore) · "How sure" rows in cards · "How we know this" · "How we'll know it
worked" · Expand all / Collapse all · "sample data" chips · bullet dots in chips · divider
lines between cards inside a part (dividers only between major sections) · "Review N" line
above the glance · thesis and "Three moves" summary · light theme · the "More metrics"
dropdown · the value and change line in chart headers · "Compare the fixes" and the separate
"What the <date> review will check" fold (both live in the plan rows) · tool
pills · uppercase labels · the "What your charts say" label · group-tile
blurbs · section taglines that restate a heading · a "How sure" column whose rows all match ·
pink side stripes · boxed tables with filled headers · diffs in skill fixes · "Start with the X
chart" · "Higher: … Lower: …" under charts · the word "cycle" · "What each trend covers" (now
inside "How these are measured") · the "Habits over the last year" heading.
