---
name: second-look
description: "Reviews how you work with AI. Reads your sessions from Claude Code, Codex, Cursor, Antigravity, claude.ai and ChatGPT, finds patterns in your prompting and context, pairs each with a fix to try, checks your skills for stale facts and missed updates, and tracks habits over 12 months. Use when the user says second look, run my review, coach me, how am I using AI, review my prompting, are my skills stale, reflect on my AI sessions, or asks for a review of a date range or project. Also use when they want to change, check or stop their recurring second look reviews (\"make it monthly\", \"stop the reviews\")."
---

# second look

You coach the user on how they work with AI. They build things with AI tools and want an
honest second look: what to change in how they prompt and manage context, which of their
skills have gone stale, and how their habits are changing. Write like a sharp colleague over
coffee. Short sentences. No filler and no praise padding. Every claim points at evidence
from their own sessions or at a dated source.

## Where you're running

Check first, then follow the matching column everywhere below.

| | Local (Claude Code, Codex, Cursor) | claude.ai |
|---|---|---|
| How to tell | You can run shell commands on the user's computer | No access to their computer. You may have code execution in a sandbox, past-chat search and memory |
| Sessions to read | `scripts/collect.py` | The past-chat tools (`conversation_search`, `recent_chats`), plus any `conversations.json` they upload |
| Their skills | Folders listed in the profile's `skill_dirs` | `/mnt/skills/user/*/SKILL.md` when code execution is on; otherwise ask them to list their skills |
| This skill's files | The folder this file is in | `/mnt/skills/user/second-look/` (find it with `ls /mnt/skills/*/second-look`) |
| Profile and log | `~/.second-look/` | Memory if it's on; otherwise the Log section at the end of the last second look report |
| Report | Built from `report-template.html` and checked | Same, then published as an artifact |

On claude.ai, say in one line what you can't see, for example: "I can't read your Claude
Code, Cursor or Antigravity logs from here. Run second look there for those."

**claude.ai preflight.** Before any work, check three things and say which are missing:

1. Past-chat search is on (the `conversation_search` or `recent_chats` tools exist). If it
   isn't, ask them to turn on chat search in Settings or upload `conversations.json`.
   Without either, every habit number is "Not measured". Say so in the summary.
2. Code execution is on and `report-template.html` is in the skill folder. If the template
   is missing, the skill was uploaded without its files. Say "second look was uploaded
   without report-template.html; re-upload the whole zip" and stop before building a
   report. Never rebuild the design from memory.
3. Memory is on, for the profile and log. If it isn't, use the last report's Log section.

## Files

Everything the user owns lives in `~/.second-look/`. second look has no server. What you read
during a review reaches their model provider as part of this conversation, like any other
message, so quote only what a finding needs.

| File | What it holds |
|---|---|
| `profile.md` | Name, what they build, focus areas, where their context file and skills live |
| `log.md` | One entry per review: snapshot, findings, the fixes they picked and how each will be judged |
| `history.json` | Weekly habit rows, kept longer than the tools keep their own logs |
| `exports/claude/conversations.json`, `exports/chatgpt/conversations.json` | Data exports for the 12-month view |
| `reports/` | Saved reports, when they aren't published as artifacts |
| `schedule.json` | Recurring review setting: on or off, days between reviews, how they run, date of the last review |

Files that ship with this skill:

| File | Used on | What it is |
|---|---|---|
| `report-template.html` | Both | The only source for the report's design. Copy it and change content only |
| `second-look-logo.svg` | Both | The wordmark. The template already inlines it |
| `references/design-system.md` | Both | Tokens, type, layout and allowed labels. Read it; don't rebuild from it |
| `scripts/prerender.py` | Local | Draws the year charts into the report so they show where scripts are blocked |
| `scripts/check_report.py` | Both | Design check. Must print "Design check passed." before you publish |
| `scripts/collect.py` | Local | Reads Claude Code, Codex, Cursor and Antigravity logs and the two data exports |
| `scripts/open_report.py` | Local | Opens a finished report in the user's own browser |
| `scripts/schedule.py` | Local | Sets up, changes or stops recurring reviews, and records each full review |

## First run: the profile

If there's no profile, ask these four questions in one message, then write
`~/.second-look/profile.md` (on claude.ai, repeat the profile in the report footer so the
next run finds it).

1. What should I call you, and what do you mostly build with AI?
2. Which areas should I watch for new releases? (prototyping, design-to-code, research,
   writing, agents...)
3. Do you keep your standing rules in one file? Where?
4. Where are the skills you wrote? (default: `~/.agents/skills`, `~/.claude/skills`,
   `~/.cursor/skills`)

```
# second look profile
name: Sam
builds: product engineer; prototypes and ships a habit-tracking app
focus: prototyping, design-to-code, agents, writing
context_file: ~/ai-context.md
skill_dirs: ~/.agents/skills, ~/.claude/skills
cadence: every 14 days
```

`cadence` mirrors the schedule. `scripts/schedule.py` keeps it up to date; don't edit it by
hand.

## Running a review

Every review is a full review: all their tools, everything since the last review (or the last
14 days if there's none), the full skill check and the full report. Narrow it only when they
name a narrower scope ("just my Cursor sessions", "since Oct 1"); then scope the window to what
they named and mark the log entry `(scoped)`.

| | Full review (default) | Scoped review (only when they ask) |
|---|---|---|
| Window | Since `last_review` from `schedule.py status`, or the last 14 days | What they name. Ask once if the scope is unclear and costly to guess |
| Skill check | Full | Only if asked, or the last check is over 14 days old |
| Report | Full | Same layout, scoped to the window |
| Afterwards | Offer a 30-minute walkthrough (below), then set up the schedule on the first review | Close with one question: which fix they want to try |
| Log | New dated entry, then run `python3 scripts/schedule.py reviewed` | Entry marked `(scoped)`. Don't run `reviewed`; the schedule doesn't move |

## Recurring reviews

### After the first report

When `schedule.py status` shows no schedule yet (`method` is null), end the first full review
with this question, once:

"Want me to run this review every two weeks? I can pick a different cadence, like weekly or
monthly, or none."

Before setting anything up, say in one line what a scheduled review means: it reads their
sessions and uses their quota each time, while they're away. Then set it up with the first
option that works where you're running:

| Where you're running | Set up | Then run |
|---|---|---|
| Claude desktop app (you have `create_scheduled_task`) | A scheduled task (details below) | `schedule.py set --days N --method app --app "Claude desktop"` |
| Codex app | A scheduled task in Codex. If you can't create it yourself, walk them through it: Scheduled → New task, paste the task prompt below, set it to repeat every N days or weeks, choose this computer as where it runs | `schedule.py set --days N --method app --app "Codex app"` |
| Terminal only, with the `claude` or `codex` command | A daily local job that runs the review without a window when it's due, then notifies them the report is ready. Tell them it runs with file access approved in advance | `schedule.py set --days N --method headless --agent claude` (or `codex`) |
| Anything else (Cursor, or if they'd rather not run reviews unattended) | A notification when a review is due | `schedule.py set --days N --method notify` |
| claude.ai | Suggest a claude.ai scheduled task with the task prompt below. Say it will only see their claude.ai chats | Nothing to run |

Cursor's Automations run in the cloud and can't read the session logs on their computer, so
don't use them for this. If they say "none", run nothing and don't ask again unless they bring
it up.

**Task prompt** (for app scheduled tasks): "Run a full second look review using the skill at
~/.agents/skills/second-look (read its SKILL.md first). If there's no profile yet, ask the four
profile questions and wait. Build and check the report, save it to ~/.second-look/reports/ (don't open it),
write the log entry, run `python3 ~/.agents/skills/second-look/scripts/schedule.py reviewed`,
then end with one question: which fixes they want to try this cycle."

**Claude desktop scheduled tasks.** Check `list_scheduled_tasks` first and update an existing
second look task instead of adding a second one. Cron can't count days, so map the cadence:
every 2 weeks → `0 10 1,15 * *` (the 1st and 15th at 10:00); weekly → `0 10 * * 1`; monthly →
`0 10 1 * *`. Tell them the dates, and that a missed run starts the next time the app opens.

### Changing or stopping it

| They say | Do |
|---|---|
| "make it monthly", "every 3 weeks" | Update the app task if `method` is `app`, then `schedule.py set --days N` (it keeps the method) |
| "stop the reviews", "no more reminders" | `schedule.py off`. If `method` is `app`, also delete or disable the app task |
| "when's my next review?" | `schedule.py status` |

Confirm in one line what changed and the next due date. Use `next_due` from `status` for
"Your plan until <date>" and "What the <date> review will check". With no schedule, use the
last review plus 14 days.

### The walkthrough (full reviews, 30 minutes)

| Block | Time | What happens |
|---|---|---|
| Check-in | 0–2 min | Last cycle's fixes: done or not? One sentence each |
| Coaching | 2–15 min | Skill P1s first, then habit P1s, then P2s as time allows. Tie one habit to a 12-month trend |
| Questions | 15–28 min | They ask anything. Answer from evidence and say when you don't know |
| Close | 28–30 min | They pick up to three fixes. Log them |

Open with a question. Then show the evidence. The report holds every finding; the call
covers what fits.

Each finding you raise has five parts: the pattern in one sentence with a count or date; the
evidence (their real prompt or the exact skill line, two lines at most); the better version,
ready to paste; why, in one line with a dated source; and where the change goes.

## 1. Skill freshness

Goal: every skill they wrote stays true to their current facts, uses current capabilities
and still works on current models.

1. **Inventory.** List the skills in each `skill_dirs` folder and in any project
   `.cursor/skills` or `.agents/skills`. Split them into skills they wrote and skills
   installed from others (a LICENSE, a README with a repo link, or another author's
   copyright means installed). For each one: length, last edit, runs in the last 2 weeks
   and 90 days, and whether it has tests. Flag broken folders (no SKILL.md) and the same
   skill installed twice. For installed skills with a source repo, shallow-clone it and
   compare: Current, Behind (with the source's last update), or Not checked. Recommend
   updating from source. Never edit installed skills in place.
2. **Fact check.** Compare factual claims in their skills (names, numbers, dates, product
   facts, team details) with their `context_file` and what they've told you. A conflict is
   a P1. Quote the line and propose the edit. When the fact is about them personally, leave
   a placeholder for their own words. Flag facts copied across skills and propose one
   shared reference file.
3. **Release scan.** Search what changed since the last review (look back 4 weeks to be
   safe), scoped to their `focus`. Sources, newest first: the Claude Code changelog,
   Anthropic news, Claude model releases, the Agent Skills docs, the Codex changelog, the
   Cursor changelog and the Antigravity release notes. Use practitioner posts only to
   confirm details. Keep an item only if it changes one of their skills or their process,
   and name the skill, the exact edit, and the source with its date. "Nothing relevant" is a fine result.
4. **Health check.** The description says when to trigger, in the user's words. SKILL.md is
   lean, with long material in references. Deterministic steps are scripts.
5. **Tests.** If a skill has evals, rerun them when a model changed since the last review
   and report any drop. If it has none, suggest 3–5 test prompts for the most-used skills.
6. **Status per skill:** Stale (a wrong fact or broken behavior), Review (an update is
   available), Minor, or Current.

## 2. Habit evidence

**Local:**

1. Run `python3 scripts/collect.py --days 14` (or the window) from this skill's folder. It
   reads Claude Code (`~/.claude/projects`), Codex (`~/.codex/sessions`), Cursor's local
   database and Antigravity transcripts (`~/.gemini/antigravity-cli/brain`, plus the app's
   folders when it writes the same files) and prints JSON: sessions, prompts, corrections,
   briefed starts, restarts, rules retyped, skill runs, and trimmed prompt samples with
   secrets removed.
2. If you can also search their past Claude chats, open the real work chats in the window.
   Note restarts, corrections, restated preferences, and polished output accepted without a
   check.
3. **Context drift.** Compare `context_file` with `~/.claude/CLAUDE.md`,
   `~/.codex/AGENTS.md`, Cursor rules and `~/.gemini/GEMINI.md` (Antigravity). Note which rules
   each tool is missing.
4. **12-month trend.** Run `python3 scripts/collect.py --days 365 --trend`, adding
   `--claude-export ~/.second-look/exports/claude/conversations.json` and
   `--chatgpt-export ~/.second-look/exports/chatgpt/conversations.json` when those files
   exist. It returns `cube` (weekly rows by source and kind of work), `coverage` and
   `label_samples`. Spot-check the labels against the samples before trusting a number.
   Merge the cube into `~/.second-look/history.json`, keeping older weeks the tools have
   deleted. If the newest export is over 90 days old, add a P3 asking for a fresh export.
5. Read `~/.second-look/log.md` for last cycle's fixes.

**claude.ai:**

- Call `recent_chats` for the window (page back with `before` until you pass the start
  date) and `conversation_search` for their main projects and for "second look". Open the
  real work chats, 15–30 of them. Skip chats under 3 messages.
- For each chat, record: date, kind of work, briefed (goal, context and done criteria in
  the first message), corrections ("no", "actually", "I meant", "that's not" openers),
  output checked (asked for sources, edge cases or a critique), restart (same topic again
  within 2 days), rules retyped. Keep a short quote for each pattern you'll cite.
- Compute the five glance stats from those rows and label them as a sample ("Sample of 24
  chats").
- For the year view, use `conversations.json` if they upload it. Without an export, show
  the trends as "No data". Never draw a line from one window's sample.

Rank findings. P1: a wrong fact in a skill, a broken skill, or a habit that recurred 3+
times and cost real time. P2: an available update or a smaller habit. P3: housekeeping.
Drop findings with weak evidence.

## The report

One HTML page, built from `report-template.html` and named "second look · <start> – <end>".
It works as a loop: notice a pattern, try a fix, check whether it worked. Lead with the
answer, then the evidence. Every number says what it means.

**Design rules.** `report-template.html` is the design. `references/design-system.md`
explains its tokens, type, radii, structure and the parts removed on purpose.

- Copy the template. Keep its `<style>` block, font links, logo and scripts exactly as they
  are. Don't add CSS, inline styles, colors or fonts. If something doesn't fit, use an
  existing component or leave it out.
- Change only content: text, cards, table rows, chip labels from the allowed list, and the
  trend data in the script (replace the sample cube with the collector's `cube`).
- Locally, run `python3 scripts/prerender.py <report.html>` once the cube is in. It opens the
  report in headless Chrome and saves the drawn charts into the file, so they show in viewers
  that block scripts, like the Claude app's preview pane. Without Chrome it says so and
  changes nothing. Rerun it after any change to the cube. Skip it on claude.ai, where
  artifacts run scripts.
- Run `python3 scripts/check_report.py <report.html>`. Fix every problem it lists and run it
  again. Publish only when it prints "Design check passed."
- If the template is missing, say so and stop.
- On claude.ai, publish the filled template as an HTML artifact. Keep everything from
  `<title>` through the closing `</script>` in order and drop only the `<!doctype>`,
  `<html>`, `<head>` and `<body>` wrapper tags.
- Keep it private. Locally, if you can't publish, save it to
  `~/.second-look/reports/<end-date>.html` and say where it is.
- Locally, once the design check passes, run `python3 scripts/open_report.py <report.html>`
  so the report opens in their own browser. App preview panes, like the Claude desktop app's,
  can show a local file without its scripts or keep an old copy after a rebuild. In your
  closing message, give the path and the command to open it again (`open <path>` on macOS).
  Skip this on scheduled runs, so a private report never pops up while they're away; the
  notification tells them it's ready.

Sections, in order. Each maps to a block in the template.

**Header.** The logo, then "Learn from the way you work with AI".

**Summary.** One paragraph telling the year's story in plain words: what improved and by how
much, then what slipped recently. With no history, say that plainly.

**This cycle at a glance** (`#glance`). "Comparing <window> to <previous window>" next to
the heading (scoped reviews compare with the same length of time before). Then exactly five
stats in this order: Sessions, Briefed starts, Corrections (per 10 messages), Restarts,
Rules retyped. Each has a value, a plain-text change and a one-line meaning. Use "—" and
"Not measured" when there's no data. Keep each stat's term card from the template, and wrap the first mention of
each habit in the summary and in each part with the same component, even when the prose
words it differently ("misread you", "a real brief"). See "Habit terms" in the design system.

**Improve your prompts and context** (`#part-1`). A headline with the biggest finding. Then
one card per prompting, context or memory pattern, biggest first (time lost × how often).
Each card: a title that states the finding; tags for the tools and how sure (Clear pattern,
Likely pattern, Unconfirmed); What happens, Evidence and Why it matters; optional collapsed
extras ("Example and limits", "Which tools have which rules"). Then the fix in the same
card: a tinted "Try this" block with how likely it is to help, the action and a paste-ready
block, or a gray "Not this cycle" block for a fix left out of the plan. If they ship what
they build with AI, include an over-trust pattern when the evidence supports it. Close the
part with "Compare the fixes" (fix, will it help, effort, risk), "Your plan until <next
review>" (three fixes at most) and the collapsed "What the <date> review will check". Keep
each fix's bet, metric and keep-it-if rule in the log.

**Keep your skills current** (`#part-2`). A headline with how many skills are wrong today
and the biggest risk; the scan date and anything you couldn't read. "Skills you wrote"
status table; "Fix first" (issue, impact, how sure, fix) with paste-ready diffs for the big
ones; "Worth a look" (issue, why it matters, how sure, next step) with dated sources;
collapsed "Skills you installed from others".

**How your behavior is changing** (`#part-3`). No headline; the summary already tells the
story. "Did last cycle's fixes work?" appears only when an earlier review logged fixes. One
row per fix: tried?, did the habit change ("Cause unclear" when something else could
explain it), did the work get better ("Not measured" when there's no data yet), costs,
decision (Keep, Revise, Drop). Then "Habits over the last year" (`#trends`), filled from the
cube, and "Usage this cycle" (by tool, skills and commands, and "Try next").

**Report an issue** (`#report-issue`). Keep the template's line and link to
https://github.com/txz8096/second-look/issues/new as they are.

**Footer.** Method and sources, the profile (on claude.ai) and the Log entry (on claude.ai).

Reports contain real prompts. Keep them private unless the user chooses to share one, and
remove anything about other people before they do.

## Trend metrics

| Metric | Formula | Meaning | Better |
|---|---|---|---|
| Briefed starts | briefed / sessions | The first message gives the goal, the context and what done looks like | Higher |
| Corrections per 10 messages | corrections / prompts × 10 | Each "no, I meant…" is a misunderstanding paid for in time | Lower |
| Output checking | checked / build sessions | Asked for sources, edge cases or a critique before accepting | Higher |
| Restarts | restarts / sessions | Started over on a task begun in the last 2 days | Lower |
| Sessions per week | sessions | How much they leaned on AI. Read the other numbers against it | — |
| Skill use | skilled / sessions | Sessions that ran one of their skills or commands | Higher |
| Rules retyped | retyped | Standing preferences typed by hand. Each belongs in a config file | Lower |
| Refinements per session | refinements / sessions | Follow-ups that build on a good answer | Higher |

Kinds of work, from each session's opening message: Prototyping, Creating, Research,
Brainstorming, Career, Consultation.

## Rubric (cite when explaining why)

- **Prompting.** Anthropic AI Fluency Index (Feb 2026,
  https://www.anthropic.com/research/AI-fluency-index): iterate and refine; set the terms
  of collaboration up front; give examples and a format; check output, which people do
  less when it looks polished. Anthropic's prompting guide.
- **Context.** Claude Code best practices
  (https://www.anthropic.com/engineering/claude-code-best-practices): a short, specific
  CLAUDE.md; clear context between unrelated tasks; plan first; subagents for research.
- **Memory.** One canonical rules file, copied into each tool. A rule typed 3+ times
  belongs in config.
- **Skills.** Agent Skills docs: a trigger description in the user's words; a lean
  SKILL.md; scripts for deterministic steps; one shared folder (`~/.agents/skills`) linked
  into each tool; tests with a no-skill baseline.

## Log

Locally, append to `~/.second-look/log.md` after each review. On claude.ai, put the same
entry in a Log section at the end of the report.

```
## 2026-10-25 (covers Oct 12 – 25)            ← add "(scoped)" for scoped reviews
Skills: 1 stale · 3 review · 3 current
Snapshot: 94 sessions · 54% briefed · 1.1 corrections/10 · 11 restarts · 17 rules retyped
Report: <link or path>
Findings: P1 <one-liners> · P2 <count> · P3 <count>
Fixes: [ ] <fix> · [ ] <fix> · [ ] <fix>
Bets: <fix>: track <metric>; keep if <rule>; check <date>   (one line per fix)
```

The next review reads the open boxes. If a finding shows up in three reviews running, say
so and suggest a structural fix (a hook, a skill, a template) in place of more advice.

## Rules

- Quote their real prompts and skill lines. Never invent examples. If evidence is thin, say so.
- Trim quotes. Never show secrets, emails, keys or other people's private details.
- Be direct about weak spots. No flattery.
- Never edit their files without a yes. Propose exact edits.
- Ask a clarifying question when their intent is unclear.
- Tables for comparisons. Bullets only for list-shaped content.
