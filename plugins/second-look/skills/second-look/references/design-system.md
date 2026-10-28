# second look report design system

The source of truth is `report-template.html` (a filled-in sample report).
Build every report from a copy of it. Keep its charset line, `<style>` block, font links, logo and scripts
exactly as they are. Change only the text, the table rows, the cards and the sample data.
`scripts/check_report.py` fails any report whose styles differ from the template.

## Tokens (dark only)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#16181D` | Page background |
| `--surface` / `--surface-2` | `#1C1F25` / `#22252C` | Panels, table headers |
| `--fg` | `#F2F3F5` | Text |
| `--muted` / `--faint` | `#A8ADB7` / `#7C828D` | Secondary text, labels |
| `--line` / `--line-strong` | `#2B2F37` / `#3A3F49` | Dividers, borders |
| `--accent` | `#F2A7B8` (Proof Pink) | Links, highlights, chart series |
| `--on-accent` | `#16181D` | Text on pink fills |
| `--p1` / `--p2` / `--good` | danger / warning / success | States only |

There is no light theme. Status colours (danger, warning, success) mark states, such as a
broken skill, a stale skill or a fix that was kept. Never use them to grade the user's habits:
changes in their numbers are plain text, and "best" cells are pink, never green or red.

## Type

Familjen Grotesk for everything; IBM Plex Mono for code only. Headings 700, letter-spacing
-0.025em.

| Role | Size |
|---|---|
| Part title (`.part-head h2`) | 48px |
| Plan title | 32px |
| Pattern title, glance heading | 24px |
| Lead sentence, summary, part headline, "Try this" title, section heading | 20px |
| Body | 16px |
| Small text, tables, notes | 14px |
| Labels (uppercase, 0.08em tracking) | 12px |

## Radii

4px tables · 6px code blocks and tooltips · 8px buttons and inputs · 12px stat strip, inner
cards, panels · 20px "Try this" blocks and the plan · fully rounded chips.

## Page structure, in order

1. Header: the second look logo, then the tagline "Learn from the way you work with AI" in
   16px body text.
2. Summary paragraph (20px): the year's story.
3. This cycle at a glance (`#glance`): heading, "Comparing <window> to <previous window>",
   six stats in a 3 × 2 grid (2 columns on phones), each with value, plain-text change and a one-line meaning.
4. How your behavior is changing (`#part-1`): scan line, "Did last cycle's fixes work?"
   (only after a review with logged fixes), "Habits over the last year" (`#trends`),
   "Usage this cycle". `scripts/prerender.py` saves the drawn charts, bars and tables into
   the file and marks the section `data-static`, which hides the filters and shows a note.
   The script clears the mark and redraws with live filters.
5. Improve your prompts and context (`#part-2`): headline, pattern cards (`article.icard`),
   "Compare the fixes" table, "Your plan until <date>", collapsed next-review check.
6. Keep your skills current (`#part-3`): headline, scan line, "Skills you wrote", "Fix
   first", "Worth a look", collapsed installed skills.
7. Report an issue (`#report-issue`): one line linking to
   https://github.com/txz8096/second-look/issues/new. Keep it as the template has it.
8. Footer: method and sources.
9. Floating contents menu (`#toc`) bottom right, listing the glance, the three parts and
   Report an issue. It opens on hover and keyboard focus with CSS alone, so it works in
   viewers that block scripts; the script adds click, Escape and the current-section highlight.

## Pattern card

Rank circle and title; chips for tools and how sure; lead sentence; Evidence | Why it matters
in two columns; optional collapsed extras ("Example and limits", "Which tools have which
rules"); then the tinted "Try this" block: how-likely chip, "Try this: <fix>", the action, a
paste-ready block with Copy. A fix left out of the plan uses the gray "Not this cycle" block.

## Habit terms

Habit names carry a dashed underline. Hover or keyboard focus opens a card that says how the
habit is counted. It's pure CSS, so it works in viewers that block scripts; the script only
keeps the card on screen and lets Escape close it.

```html
<span class="term" tabindex="0" aria-describedby="def-briefed">Briefed starts<span class="term-card" role="tooltip" id="def-briefed">…</span></span>
```

Every glance stat except Sessions keeps its card from the template. In prose, wrap the first
mention of each habit in the summary, in each part's headline and cards, and in "Usage this
cycle". Wrap the words the sentence uses, even when they aren't the habit's name: "corrections",
"Claude misread you only six times", "start with a real brief". Skip headings, table cells and
chart text (charts carry their own definition line). One card per habit per section, so a
paragraph never shows the same card twice. Ids are `def-<habit>-<section>`, for example
`def-corrections-summary`, and must be unique. Cards work inside `p` and `dd`.
Use these definitions word for word:

| Term | Definition |
|---|---|
| Briefed starts | Your first message gives at least two of three things: the goal, the context, and what done looks like. Example: “Add a pricing table for freelancers. Match the current cards. Done when it fits on a phone screen.” |
| Corrections | Messages that fix a misunderstanding, like “no, I meant…” or “that’s not what I asked”. Counted per 10 messages you send, so busy and quiet weeks compare fairly. |
| Restarts | A new session that opens with mostly the same request as one from the last two days, in the same tool. It usually means the first try went off track. |
| Rules retyped | A standing preference typed by hand, like “use tables” or “no filler”. If you type it more than once, it belongs in your CLAUDE.md, AGENTS.md or Cursor rules. |
| Skill use | Sessions that ran at least one of your skills or slash commands. Each session counts once, however many it ran. |
| Output checking | In build and research sessions, the share where you asked for sources, edge cases or a critique before accepting the result. It tends to drop when output looks finished. |

## Chip labels (and nothing else)

- Patterns: Clear pattern · Likely pattern · Unconfirmed
- Fixes: Likely to help · Might help · Worth testing
- Maintenance: Confirmed · Clear · Possible
- Results: Cause unclear · Not measured
- State pills: Stale · Review · Minor · Current · Behind · Broken · Duplicate · Not checked ·
  High · Medium · Low · Keep · Revise · Drop · Gap

## Removed on purpose (don't bring back)

Numerals before part titles · goals box and "Personalize goals" · slot labels (Change now,
Practice, Explore) · "How sure" rows in cards · "How we know this" · "How we'll know it
worked" · Expand all / Collapse all · "sample data" chips · bullet dots in chips · divider
lines between cards inside a part (dividers only between major sections) · "Review N" line
above the glance · thesis and "Three moves" summary · light theme.
