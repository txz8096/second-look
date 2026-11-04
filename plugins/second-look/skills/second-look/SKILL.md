---
name: second-look
description: "Reviews how you work with AI. Reads your sessions from Claude Code, Codex, Cursor, Antigravity, claude.ai, ChatGPT and Gemini, finds patterns in your prompting and context, shows where your token usage goes, spots repeat work you could hand to a skill, hook or schedule, pairs each with a fix to try, checks your skills for stale facts and missed updates, and tracks habits over 12 months. Use when the user says second look, run my review, coach me, how am I using AI, review my prompting, what should I automate, are my skills stale, reflect on my AI sessions, or asks for a review of a date range or project. Also use when they want to change, check or stop their recurring second look reviews (\"make it monthly\", \"stop the reviews\"), add a claude.ai, ChatGPT or Gemini export (\"add my ChatGPT export\"), or keep more history (\"keep a year of logs\")."
---

# second look

You coach the user on how they work with AI. They build things with AI tools and want an
honest second look: what to change in how they prompt and manage context, which repeat work
should stop depending on them, which of their skills have gone stale, and how their habits are
changing. Short sentences. No filler and no praise padding. Every claim points at evidence from their own sessions or at a dated source.

A review runs in four steps, then the report:

1. **Skill freshness.** Are the skills they wrote still true and current?
2. **Habit evidence.** What do their sessions show about briefing, correcting, checking,
   handing off and usage?
3. **Repeat work.** Which requests keep coming back by hand, and what runs without them?
4. **The report.** One page, built from the template, that ends in a plan they can try.

## Where you're running

Check first, then follow the matching column everywhere below.

| | Local (Claude Code, Codex, Cursor) | claude.ai |
|---|---|---|
| How to tell | You can run shell commands on the user's computer | No access to their computer. You may have code execution in a sandbox, past-chat search and memory |
| Sessions to read | `scripts/collect.py` | The past-chat tools (`conversation_search`, `recent_chats`), plus any `conversations.json` they upload |
| Their skills | Folders listed in the profile's `skill_dirs` | `/mnt/skills/user/*/SKILL.md` when code execution is on; otherwise ask them to list their skills |
| This skill's files | The folder this file is in | `/mnt/skills/user/second-look/` (find it with `ls /mnt/skills/*/second-look`) |
| Profile and log | `~/.second-look/` | Memory if it's on; otherwise the Log section at the end of the last second look report |
| Repeat work | `automation` block from `collect.py` | Not measured: claude.ai doesn't log how a chat started or which tools ran |
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
| `exports/claude/conversations.json`, `exports/chatgpt/conversations.json`, `exports/gemini/MyActivity.json` | Data exports for the 12-month view |
| `reports/` | Saved reports, when they aren't published as artifacts |
| `schedule.json` | Recurring review setting: on or off, days between reviews, how they run, date of the last review |

Files that ship with this skill:

| File | Used on | What it is |
|---|---|---|
| `report-template.html` | Both | The only source for the report's design. Copy it and change content only |
| `second-look-logo.svg` | Both | The wordmark. The template already inlines it |
| `references/design-system.md` | Both | Tokens, type, layout and allowed labels. Read it; don't rebuild from it |
| `scripts/collect.py` | Local | Reads Claude Code, Codex, Cursor and Antigravity logs and the three data exports |
| `scripts/prerender.py` | Local | Draws the year charts and the data-scope line into the report so they show where scripts are blocked |
| `scripts/check_report.py` | Both | Design check. Must print "Design check passed." before you publish |
| `scripts/open_report.py` | Local | Opens a finished report in the user's own browser |
| `scripts/add_export.py` | Local | Finds a claude.ai, ChatGPT or Gemini export and files it in `~/.second-look/exports` |
| `scripts/schedule.py` | Local | Sets up, changes or stops recurring reviews, and records each full review |

## Adding an export

When they say "add my ChatGPT export" (or claude.ai, or Gemini), or drop an export into the
chat, file it for them. Never ask them to open `~/.second-look`.

- **Local:** if they dragged in a file or folder, run `python3 scripts/add_export.py PATH`.
  Otherwise run `python3 scripts/add_export.py` (add `--app chatgpt`, `claude` or `gemini`
  when they named one); it looks in Downloads and Desktop. It tells exports apart by what's
  inside, so the zip's name doesn't matter. Repeat its result lines in plain words, like
  "Added your ChatGPT export: 1,240 chats, Jan 2025 to Oct 2026." If it finds nothing,
  give them its steps for getting one and say they can drag the zip in when it arrives.
  If macOS asks for access to Downloads, tell them to allow it, or to drag the zip in instead.
- **claude.ai:** ask them to upload `conversations.json` (or Gemini's `MyActivity.json`)
  here. It's used for this review only.

Getting each export: claude.ai, Settings → Privacy → Export data. ChatGPT, Settings → Data
controls → Export data. Gemini, takeout.google.com → My Activity, filtered to Gemini Apps,
format JSON (the "Gemini" option exports Gems only). Each arrives as a zip by email,
usually within a day.

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
| Anything else (Cursor, Antigravity, or if they'd rather not run reviews unattended) | A notification when a review is due | `schedule.py set --days N --method notify` |
| claude.ai | Suggest a claude.ai scheduled task with the task prompt below. Say it will only see their claude.ai chats | Nothing to run |

Every option reads all their local tools, Antigravity included, and the exports in
`~/.second-look/exports`. ChatGPT and Gemini (the web app) have no way to run the review, so
their history only updates when they download a fresh export. The daily job's notifications
remind them when an export is over 90 days old.

Cursor's Automations run in the cloud and can't read the session logs on their computer, so
don't use them for this. If they say "none", run nothing and don't ask again unless they bring
it up.

**Task prompt** (for app scheduled tasks): "Run a full second look review using the skill at
~/.agents/skills/second-look (read its SKILL.md first). If there's no profile yet, ask the four
profile questions and wait. Build and check the report, save it to ~/.second-look/reports/ (don't open it),
write the log entry, run `python3 ~/.agents/skills/second-look/scripts/schedule.py reviewed`,
then end with one question: which fixes they want to try before the next review."

**Claude desktop scheduled tasks.** Check `list_scheduled_tasks` first and update an existing
second look task instead of adding a second one. Cron can't count days, so map the cadence:
every 2 weeks → `0 10 1,15 * *` (the 1st and 15th at 10:00); weekly → `0 10 * * 1`; monthly →
`0 10 1 * *`. Tell them the dates, and that a missed run starts the next time the app opens.

A scheduled review is itself an unattended run, and `collect.py` counts it in "Runs you didn't
start". That's expected; don't call it out as a finding.

### Changing or stopping it

| They say | Do |
|---|---|
| "make it monthly", "every 3 weeks" | Update the app task if `method` is `app`, then `schedule.py set --days N` (it keeps the method) |
| "stop the reviews", "no more reminders" | `schedule.py off`. If `method` is `app`, also delete or disable the app task |
| "when's my next review?" | `schedule.py status` |

Confirm in one line what changed and the next due date. Use `next_due` from `status` for
"Your plan until <date>" and its plan rows. With no schedule, use the
last review plus 14 days.

### The walkthrough (full reviews, 30 minutes)

| Block | Time | What happens |
|---|---|---|
| Check-in | 0–2 min | The fixes from the last review: done or not? One sentence each |
| Coaching | 2–15 min | Skill P1s first, then habit P1s, then P2s as time allows. Tie one habit to a 12-month trend |
| Questions | 15–28 min | They ask anything. Answer from evidence and say when you don't know |
| Close | 28–30 min | Confirm the plan: every fix in the report. Log them |

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
   secrets removed. Blocks that cover Claude Code and Codex only, the tools that log tokens
   and tool calls:
   - `usage`: long-session share, typical request, the biggest sessions, usage-limit hits,
     and `starting_context` (what loads before the first message, unused skills and plugins,
     copied instruction files, and the gain from trimming them).
   - `agent_checks`: sessions where the agent edited code, how many ran a test, build, lint,
     browser check or verifying subagent after the last edit, and `unchecked_ships` (a commit,
     push, deploy or "ship it" while code edits were still unchecked) with samples. Prose and
     settings files don't count as code. Open two samples and confirm them in the log before
     citing the number.
   - `delegation`: sessions that handed work to a subagent (by purpose: research, check,
     build) and "Sessions crowded with lookups" (`read_heavy`: 25+ reads and searches in the main
     conversation, no subagent) with their share of usage.
   - `automation`: see "3. Repeat work".
2. If you can also search their past Claude chats, open the real work chats in the window.
   Note restarts, corrections, restated preferences, and polished output accepted without a
   check.
3. **Context drift.** Compare `context_file` with `~/.claude/CLAUDE.md`,
   `~/.codex/AGENTS.md`, Cursor rules and `~/.gemini/GEMINI.md` (Antigravity). Note which rules
   each tool is missing.
4. **12-month trend.** Run `python3 scripts/collect.py --days 365 --trend`, adding
   `--claude-export ~/.second-look/exports/claude/conversations.json` and
   `--chatgpt-export ~/.second-look/exports/chatgpt/conversations.json` and
   `--gemini-export ~/.second-look/exports/gemini/MyActivity.json` when those files
   exist. It returns `cube` (weekly rows by source and kind of work), `coverage`,
   `label_samples` and an `automation` block matched across the whole year. Spot-check the
   labels against the samples before trusting a number.
   Merge the cube into `~/.second-look/history.json`, keeping older weeks the tools have
   deleted. If any export is over 90 days old, add a P3: download a fresh one and say
   "add my <app> export". Gemini's export has no conversation ids, so the collector
   groups prompts less than 30 minutes apart into one session: call its session-based
   numbers (restarts, briefed starts) estimates.
5. Read `~/.second-look/log.md` for the fixes from the last review.

**claude.ai:**

- Call `recent_chats` for the window (page back with `before` until you pass the start
  date) and `conversation_search` for their main projects and for "second look". Open the
  real work chats, 15–30 of them. Skip chats under 3 messages.
- For each chat, record: date, kind of work, briefed (goal, background and done criteria in
  the first message), corrections ("no", "actually", "I meant", "that's not" openers),
  output checked (asked for sources, edge cases or a critique), restart (same topic again
  within 2 days), rules retyped. Keep a short quote for each pattern you'll cite.
- Compute the first five glance stats from those rows and label them as a sample ("Sample of 24
  sessions"). See "Last 4 weeks at a glance" for its heading. Long-session share is "Not measured" here: claude.ai doesn't share token counts.
- For the year view, use `conversations.json` if they upload it. Without an export, show
  the trends as "No data". Never draw a line from one window's sample.

Rank findings. P1: a wrong fact in a skill, a broken skill, or a habit that recurred 3+
times and cost real time. P2: an available update or a smaller habit. P3: housekeeping.
Drop findings with weak evidence.

## 3. Repeat work

Goal: work that comes back on a rhythm, or the same way every time, stops depending on them
to remember and retype it. Local only, from Claude Code and Codex.

Read the `automation` block from the 365-day run, since repeats need history to show up:

| Field | What it is |
|---|---|
| `unattended_sessions` | Sessions a scheduled task, a loop or a headless run (`claude -p`, `codex exec`) started |
| `setup_sessions`, `set_up_with` | Sessions that created or changed a loop or schedule, and with what: `/loop`, `/schedule`, a desktop scheduled task, cron, launchd, a wake-up |
| `parallel_sessions` | Sessions that started a background command or another agent run. Helper agents count under delegation instead |
| `repeat_sessions` | Sessions whose opening request matches 3 or more earlier ones, with no skill run and no schedule behind it |
| `repeats` | The requests that keep coming back: `times`, `by_hand`, `last_4_weeks`, `first`, `last`, `weekday` (set when 60%+ land on one day), `sources`, `with_skill`, and the latest `opener` |

Repeats are matched by shared words, so open each one before you cite it. Drop a group when
the openers ask for different things that happen to share words, when an app wrote the
request for them (a review-feedback handoff, a health check like "What is 2+2?"), or when the
work is the same kind but the content always changes (a new essay each time is ordinary
writing work). Say how many you dropped.

For each repeat you keep, pick one fix. Ask in this order:

| If the request… | The fix | Example |
|---|---|---|
| Should run whether or not they remember, on a rhythm (a `weekday`, or "check", "summarize what changed", "status") | A scheduled task: Claude desktop or Codex app scheduled task, `/schedule`, or `/loop` while a session is open | "Make it a scheduled task every Monday" |
| Follows every edit, commit or session end | A hook (`Stop`, `PostToolUse`, a pre-commit hook) | "Make it run on its own after every edit" |
| Is the same steps or standing instructions, started when they choose | A skill, or a line in their instruction file when it's one rule | "Save it as a skill" |
| Already has a skill they skip (`with_skill` above 0) | Fix the existing skill's description so it triggers on their words | "Add 'tracker update' to the job-tracker skill's description" |

Never set up a schedule, hook or skill during the review. Propose it with paste-ready text;
they say yes first.

A repeat that came back 4 or more times in the last 4 weeks and cost real time is also a
P1 habit: give it a card in "Improve your prompts and setup" so its fix joins the plan.

## 4. The report

One HTML page, built from `report-template.html` and named "second look · <start> – <end>".
Lead with the answer, then the evidence.

**One comparison window.** Every habit number that shows a change compares the last 4 weeks with
the 4 before: the glance, the cards, the charts and the tables. So a habit has one number and one
change, and signs can't disagree. Take them from the chart table "Last 4 weeks vs the 4 before"
(the script works it out from `CUBE`). A card may also cite dated events ("Oct 14–15"), with the
dates. Name every window: a 4-week number says "last 4 weeks"; something counted over the review
period says "since your last review" with its dates. Never write "cycle". On a first review, say
what it covers ("Sep 28 – Oct 25") instead. One exception: the summary may tell the year's story
in words, with its own dates ("up from three in ten in Nov 2025"). Every number shown with a change
stays on the 4-week window. A change needs 10 sessions in each 4-week window, wherever it's
reported, in the tables and in your prose. Below that, say there are too few sessions to compare.

**Plain words.** Write for someone who builds with AI but doesn't read code. Keep these out of
prose, tables and chart text: tokens, context (say "what the AI has read"), compaction, subagent
(say "helper agent"), hook, headless, cron, lint, diff, tool calls, config file, file paths like
`~/.claude`, P1, cube, turn (say message), commit and push (say saved or shipped), source (say
tool), edge case (say what could break). Commands they type (`/clear`) and anything inside a copy
block are fine. One word per thing: session (never chat or conversation), the AI (never the
agent), rules (never standing preferences), helper agent, usage and usage limit, brief, checking,
fix, second look (never "the coach" or "I"). Each fix keeps one name everywhere. Cut a line that
only restates a heading, a column or a term card. An action they can't do by hand gets a prompt
to paste into their AI tool, and says which tool. Every next step, in any table or list, says where
to go or gives the line to paste ("Tell Claude Code: “Reinstall mermaid-diagrams.”"), so nothing
ends on "update it" or "remove it" alone. Say what the logs show and nothing about why unless the
evidence shows why: "no check in the session", never "you didn't check".

Skill names, file names and project names stay as they are, even with a word from this list in
them. Put a name in `<code>` when the checker flags it, and their own words in curly quotes.
Never rename a real skill to get past the checker.

**How to write.** Start with the finding. One fact per sentence. Say "you". No praise, no
scene-setting, no closing sentence that sums up. Don't write "not just", "X, not Y" or "rather
than"; state the point. Count real items: two things stay two, never padded to three. No clause
bolted on with "-ing" ("…, showing that"). No colon that sets up a reveal. At most one em dash per
block. Never use: crucial, robust, seamless, groundbreaking, transformative, vibrant, leverage,
synergy, paramount, multifaceted, myriad, delve, tapestry. If a sentence could appear unchanged in
someone else's report, add their number or cut it. The chip carries the doubt: add one limit per
card only when it would change what they do. Write the card title the way you'd say it to them in
one breath. The caps below apply to your text even where the template's sample looks longer.

**Caps.** At most five cards, biggest first; the rest go in the log. Card title: a finding, ten
words or fewer. What happens: two sentences. Evidence: up to three facts, each with its window.
Why it matters: one sentence about their work. Fix first and Worth a look: five rows each.

**Design rules.** `report-template.html` is the design. `references/design-system.md`
explains its tokens, type, radii, structure and the parts removed on purpose.

- Copy the template. Keep its viewport line, `<style>` block, favicon and font links, logo and
  scripts exactly as they are. The viewport line and the styles are what make the report
  readable on a phone. Don't add CSS, inline styles, colors or fonts. If something doesn't fit,
  use an existing component or leave it out.
- Change only content: text, cards, table rows, chip labels from the allowed list, the
  `moved` class on glance rows, the "What you could automate next" rows, and the four data values at the top of the trends
  script. Leave the rest of the script as it is.
  - `END`: the Monday of the last complete week, as `"YYYY-MM-DD"` (the collector's
    `last_complete_week`). The week in progress stays out, because a few days would read as a
    quiet full week. The charts show the 52 weeks up to `END`, and the newest days wait for the
    next review. Someone whose every session is in the week in progress gets that week, and the
    collector already returns it.
  - `CUBE`: replace `sampleCube()` with the collector's `cube` array, plus the older weeks kept
    in `history.json`, pasted as is. A week and tool in the cube replaces the same week and tool
    in history, so nothing counts twice. Rows keep the collector's `week`, `source` and `category`
    keys. Weeks outside the 52 are left out.
  - `SCOPE`: the collector's `scope` (see "Data scope").
  - `MILESTONES`: dated changes to mark on every chart, like a fix they started from
    `log.md`, as `[{"week": "YYYY-MM-DD", "label": "..."}]`. Labels stay under 25 characters, in
    plain words. Use `[]` when there are none.
- Locally, run `python3 scripts/prerender.py <report.html>` once the data is in. It opens the
  report in headless Chrome and saves the drawn charts into the file, so they show in viewers
  that block scripts, like the Claude app's preview pane. Without Chrome it says so and
  changes nothing. If it says the chart script failed, open the report in a browser, fix the
  error the console shows, and run it again. Rerun it after any change to the data or the
  automation rows. Skip it on claude.ai, where artifacts run scripts.
- Run `python3 scripts/check_report.py <report.html>`. Fix every problem it lists and run it
  again. With a pasted cube it works out the six glance rows and prints the right number for
  any row that's off. Publish only when it prints "Design check passed."
- If the template is missing, say so and stop.
- On claude.ai, publish the filled template as an HTML artifact, from its first line
  through the closing `</script>`, in order.
- Keep it private. Locally, if you can't publish, save it to
  `~/.second-look/reports/<end-date>.html` and say where it is.
- Locally, once the design check passes, run `python3 scripts/open_report.py <report.html>`
  so the report opens in their own browser. App preview panes, like the Claude desktop app's,
  can show a local file without its scripts or keep an old copy after a rebuild. In your
  closing message, give the path and the command to open it again (`open <path>` on macOS).
  Skip this on scheduled runs, so a private report never pops up while they're away; the
  notification tells them it's ready.

Sections, in order. Each maps to a block in the template.

**Header.** The logo, then "Learn from the way you work with AI", with the review's date on the
right ("Oct 25, 2026").

**Summary.** Three sentences at most. First what improved over the year, in words, with the earlier
number's month and year ("up from three in ten in Nov 2025"); the checker fails "a year ago" with no
date. This is the one exception to the 4-week window, so show no change figure here. Then
what slipped, with the date it began ("Since Sep 28, when the Streak redesign started"), so it
matches the charts' last 4 weeks. If a data source starting or changing could explain a change,
don't claim the change: compare only tools present in both windows, or leave it out. Tool coverage
goes in the scope line, not here. With no history, say that plainly: on a first review, say it's
the first and what it covers ("It covers the 26 days your tools kept").

**Start here** (`#start-here`). One line under the summary: plan row 1's name linking to its Try
block, its time, and a link to the plan. Keep the template's wording.

**Last 4 weeks at a glance** (`#glance`). "<last 4 weeks> vs <the 4 before>" next to the heading,
from `END` ("Sep 28 – Oct 25 vs Aug 31 – Sep 27"). Then exactly six rows in this order: Sessions
per week, Briefed starts, Corrections (per 10 messages), Restarts (% of sessions), Rules retyped
per week, Long-session share. The value and the change are the numbers in the chart table
"Last 4 weeks vs the 4 before", all tools and all work, printed the same way (`CUBE` is the
source; the checker recomputes them). A row whose change is past the noise floor in "Trend
metrics", in either direction, uses `class="stat moved"`; every other row uses `class="stat"`. The
meaning line is one line: where it moved, if you can say ("Up, mostly in prototype sessions."), then
which way is better ("Lower is better."). The change column already says flat or up, so don't
repeat it. The Sessions row gives the 4-week total instead ("164 in the last 4 weeks."). No colour.
When there's nothing to compare with (a first review, a measure with no earlier data, or under 10
sessions in either window), leave the change empty: no "—", no "Baseline". Use "Not measured" when
the sources can't give a measure, like long-session share from claude.ai alone, or there are too
few sessions in the last 4 weeks to show it. A scoped or sampled review works the same rows out from its
own scope: add `data-scoped` to the `#glance` section (a sampled one says "Sample of 24 sessions"
next to the heading) and name the scope in the heading and the contents menu ("Since Oct 1 at a
glance"), because "Last 4 weeks" would be false there. Keep each stat's term card from the template, and wrap the
first mention of each habit once in the summary and once inside a card body, even when the prose
words it differently ("misread you", "a real brief"). Skip the term when the sentence already
defines it. Skip part headlines. See "Habit terms" in the design system.

**Improve your prompts and setup** (`#part-2`). A headline with the biggest finding that
links to the plan. Then "Did the fixes from your last review work?" (`#last-cycle`), only when an
earlier review logged fixes (delete it on a first review): one line per fix, opening with its
decision pill (Keep, Revise, Drop), then the fix's name in bold and one sentence on what changed,
with its window. Add a second only when something else more likely explains it, or the fix is younger than the window. Then one card per prompting, context, memory or repeat-work pattern,
biggest first (time lost × how often). Number the cards from 1 in the `.rank` circle, and put any card without a fix last, so a card's number is its fix's number in the plan. Each card: a title that states the finding; the tools as
plain text and one how-sure chip (Sure, Likely, Hunch); What happens, Evidence and Why it
matters; when you have one, their own prompt quoted in the card; an optional collapsed "Which tools have which rules". Then the fix in the same
card: the "Try this: <fix name>" block, the action in plain steps per tool ("Cursor: Settings →
Rules"), and a paste-ready block. Every pattern with a fix gets one, and every fix goes in the
plan. How-sure chips mean: Sure, seen repeatedly or checked in their files. Likely, repeated, but
something else could explain it. Hunch, thin evidence.

- **Over-trust.** If they ship what they build with AI, include an over-trust pattern when the
  evidence supports it. Build it from both sides: checks they asked for (Output checking) and
  checks the AI ran (Tested by the AI, Untested changes shipped). Name which side is weak, since the
  fixes differ: asking better questions, or a saved rule that runs the check before anything
  ships. The logs can't see checks they did themselves in a browser or in their head, so say
  "no check in the session", never "you didn't check".
- **Long sessions.** When long sessions take a large share of usage, fold that into a
  long-session card (see "Usage").
- **Delegation.** When "Sessions crowded with lookups" take a tenth of usage or more, add a
  delegation card: the fix hands wide reading to a helper agent that returns a short answer,
  and hands checks to a fresh helper agent that gets the claim and where to verify it, never
  the reasoning behind it. Keep building, taste and anything that needs their own facts in the
  main session.
- **Repeat work.** A P1 repeat from "3. Repeat work" gets a card whose "Try this" holds the
  schedule, hook or skill, ready to paste. In the fix line, say what it does ("runs on its own
  every Monday"), not the mechanism ("Stop hook").

Close the part with "Your plan until <next review>" (`#plan`), the only pink panel: one
numbered row per fix, in card order. Each row has the fix's name (the same words as its Try
block, linking to it), the same how-sure chip as its card, the time it takes
(`.plan-effort`) and what the next review will check, naming real charts (`.plan-check`, with the
template's `data-label`). The column line above the list carries the review date. A skill fix that blocks a
row gets a `.plan-first` line linking to it. End with the `.plan-next` line linking to the other
skill fixes and to "What you could automate next"; drop a link with nothing behind it. A fix
appears twice in the report: its Try block and its plan row. Keep each fix's bet, metric and
keep-it-if rule in the log.

**Keep your skills current** (`#part-3`). A one-sentence headline with how many skills are
wrong today (count every skill marked Stale, and a wrong fact is Stale); the scan date and anything
you couldn't read, named as a place ("your Cursor skills folder"), with what that means for the
counts. "Fix first" (`#fix-first`; issue, impact pill, fix), blockers first. The fix cell names an
action; a sentence on why goes under the issue as `.def`. Weigh impact by use: a skill with no runs
isn't High. The big ones get a prompt to paste into their AI tool in a `.fix-block`, shown open,
with an id the plan can link to (`fix-pr-review`), saying which tool to open. Never show a diff.
"Worth a look" (issue, why it matters, how sure, next step), including the
starting-context row from "Usage" when it applies. Next steps are something they can do or ask
their AI to do. Collapsed "Skills you wrote" (a status table, with the counts in its summary line);
collapsed "Skills you installed from others". Counts agree across all of it. Keep the tap
definition on the first "skills" in the headline.
When every row of a column says the same thing, drop the column and say it once. Dated sources
go in the footer.

**How your habits are changing** (`#part-1`). The id stays `#part-1`. No headline; the summary already tells the story. Fill the scope line
and "How these are measured" from `SCOPE` (see "Data scope").

- **Habits over time** (`#trends`), filled from the cube. Its charts sit in five
  groups, one tab per question (`GROUPS` in the template script): explaining what you want,
  checking the work, handing off big searches, automating repeat work, and where usage goes.
  The group with the most charts going the wrong way opens first. A group with no chart that
  has data under the current filters is hidden, and one line names it and says why: its charts
  need Claude Code or Codex, the Work filter leaves it out, or too few sessions. Each group opens
  with one written summary comparing the last 4 weeks with the 4 before (whatever the time
  filter), so it agrees with the glance and the cards; each line is a 4-week running value with
  those two points marked; milestones are labelled on the group's first chart; a chart that
  moved ends with one clause from `READS` for the direction it moved, and a flat chart has none.
  Those clauses say only what the measure did, never why. The view opens on the time range the
  data covers.
  The script writes all of this; keep the groups and their wording as they are. "How each tool's
  use is changing" uses the same two windows.
- **What you could automate next** (`#automate-next`). The script moves this block under the
  automation group's charts. One row per repeat you kept from "3. Repeat work", most repeated
  first, at most five: the request in curly quotes, trimmed to its ask; the count as
  "<n> times in <span>" from `last_4_weeks` (or `times` with the span from `first` to `last`);
  the fix as one line to paste, naming the tool ("Tell Claude Code: “Every Monday, …”"). Delete the block when there are no repeats, and on claude.ai.
- **Usage since your last review** (with its dates; on a first review, "Usage, <dates>"): the
  usage-limit line, then "Try next" (up to two features that fit how they worked, shown open, each
  saying how to turn it on),
  then the collapsed "By tool" and "Skills and commands", counted over the same dates.

**Report an issue** (`#report-issue`). One line above the footer. Keep the template's line and
link to https://github.com/txz8096/second-look/issues/new as they are.

**Footer.** Method and sources in three sentences at most (the sources list lives here, not
under tables), the profile (on claude.ai) and the Log entry (on claude.ai).

Reports contain real prompts. Keep them private unless the user chooses to share one, and
remove anything about other people before they do.

## Usage

Usage is evidence inside the parts above, never a section of its own. It answers two
questions: where did my usage go, and what can I change. "Usage" means tokens weighted by
list price (an estimate), because re-reading cached history costs about a tenth of new input.
Say "usage", never "cost" or "spend": most people are on a plan, not paying per token.

- **Compare only with themselves.** "Typical" is their own median session or request; later
  reviews also compare with the last one. Never compare with other people or a fixed number.
- **Show a usage finding only when** there is a change they can make, the next review can check
  it, and the thing involved is at least a tenth of their usage. Otherwise leave it out.
- **Long sessions** (Improve your prompts and setup). Sessions past `long_line` (150k tokens,
  a line we chose); on the page, call them "very long sessions". Give the
  share of usage they took, how a message there compares with a typical message, and the
  biggest sessions. The fix: start fresh when a phase ends.
- **Starting context** (Keep your skills current, "Worth a look"; the chart calls it "Loaded
  before you type" and shows it in words, tokens × 0.75). What loads before the first message.
  In the row: "14 unused skills load into every session / They take a tenth of your usage /
  Likely / Turn them off from loading on their own". Name the skills and plugins not run in
  `unused_days`, their share of usage (skip the row when it's under a tenth), and any
  instruction file that copies another. The fix for their own skills is
  `disable-model-invocation: true` in the frontmatter, given in a copy block: the skill stays
  installed and `/skill-name` still runs it, but it stops loading on its own. For plugins, turn
  them off in `/plugin`. Never suggest deleting or moving skills. When `log_days` is shorter than
  `unused_days`, say "since <date>, when your logs begin" and that some may simply not have come
  up yet.
- **Usage breakdown.** Doing the work, re-reading long sessions, redoing work. Show it in
  "Usage since your last review" only when `limit_hits` is 3 or more; otherwise keep the one-line note.
- Cursor, Antigravity, claude.ai, ChatGPT and Gemini don't record usage. Say so once.

## Data scope

Every report marks the edges of its data, so no one reads a gap as a habit. The template draws
it from one `SCOPE` object in its trends script, next to the cube: a dashed one-line summary
under "How your habits are changing", the timeline in the collapsed "How these are measured", a dashed
start line on any chart whose data begins at a scope limit, and a dashed "Needs Claude Code or Codex" panel
for a chart its tools can't give. Each dashed term opens a card with the reason and the
steps to add the data. Write none of this by hand.

- **Locally,** copy `scope` from `collect.py` into `SCOPE`. Each source has a `state`: `logs`,
  `export` (with `to`, the export date), `missing` (an export not added), or `not_found` (the
  tool isn't on this computer). `cut` marks the first day second look has for a source whose
  older logs were deleted. `collect.py` sets it for Claude Code when its logs reach back to the
  `cleanupPeriodDays` limit. When `history.json` holds Claude Code weeks from before
  `oldest_claude_log`, set `cut` to the first of those weeks instead.
- **On claude.ai,** mark Claude Code, Codex, Cursor and Antigravity `not_readable`, and
  claude.ai `export` only when they uploaded `conversations.json`.
- Keep "no sessions" apart from "can't see". A tool they didn't use yet is an empty track with
  no card. Only data second look can't reach is dashed.
- **First review.** Same report, no extra sections. The glance leaves changes empty when there's
  nothing earlier, "Did the fixes from your last review work?" is deleted, and each chart shows whatever
  weeks exist. A first review usually still has earlier data: Claude Code keeps 30 days, Codex
  and Cursor keep everything, so compare with the window before from logs whenever it exists.

**"Keep a year of logs."** When they ask, or say yes after a scope card suggests it, set
`cleanupPeriodDays` to 365 in `~/.claude/settings.json`, keeping every other setting. Confirm
in one line. It stops Claude Code deleting logs after 30 days. Weeks already deleted stay gone.

## Trend metrics

| Group | Metric | Formula | Counted when | Better |
|---|---|---|---|---|
| Explaining | Briefed starts | briefed / briefable | First message gives at least two of goal, background, what done looks like. `briefable` leaves out sessions that open on review comments or app context, with nothing typed to brief | Higher |
| Explaining | Corrections per 10 messages | corrections / prompts × 10 | "No, I meant…" | Lower |
| Explaining | Restarts | restarts / sessions | Same opening request as one in the last 2 days, same tool | Lower |
| Explaining | Rules retyped per week | retyped | A rule typed by hand | Lower |
| Explaining | Refinements per session | refinements / sessions | A follow-up that builds on a good answer | Higher |
| Checking | Output checking | checked / build sessions | Asked for sources, what could break or a critique | Higher |
| Checking | Tested by the AI | agent_checked / edited | A test, build, lint or browser check after the last code edit | Higher |
| Checking | Untested changes shipped per week | unchecked_ships | A commit, push, deploy or "ship it" with edits unchecked | Lower |
| Handing off | Sessions with a helper agent | delegated / metered | Handed work to a subagent | — |
| Handing off | Sessions crowded with lookups | read_heavy / metered | 25+ reads and searches, no subagent | Lower |
| Automating | Repeat tasks done by hand | repeats | Opener matches 3+ earlier ones, no skill run, no schedule | Lower |
| Automating | Sessions you didn't start | unattended / logged | Started by a schedule, a loop or a headless run | — |
| Automating | Loops and schedules set up | setups | Created or changed a loop or scheduled job | Higher |
| Automating | Work run side by side | parallel / logged | Started a background command or another agent run | — |
| Automating | Skill use | skilled / sessions | Ran one of their skills or commands | Higher |
| Usage | Sessions per week | sessions | Every session | — |
| Usage | Long-session share | long_usage / usage | Usage from sessions past 150k tokens | Lower |
| Usage | Loaded before you type | start_tokens / metered | Loaded before the first message, shown as words | Lower |

The page's wording for each lives in `METRICS` in the template script. Checking's last two, Handing
off, all of Automating except Skill use, and the last two of Usage come from Claude Code and Codex only.

`logged` counts Claude Code and Codex sessions; `metered` counts those with token counts. Each
group says once which of its charts count Claude Code and Codex only. Keep the
long-session share term card from the template on the glance stat. Every chart title has its
own card in the template's `METRICS` (how it's counted, plus one caveat); keep them as they are.
A new metric needs a group in `GROUPS` and a line in `READS`, or it won't show.

Every comparison in the report reads a change under the noise floor as "about the same": 2
points for shares, 0.1 per 10 messages for corrections, 0.1 per session for refinements, 5% for
counts. The change is worked out from the rounded numbers on the page, so the three agree. A
count is a 4-week average, so under 10 it keeps one decimal when it has one (6.8), shows the plain
difference (0.5 to 2.5 is +2) and reads "about the same" when that difference is under 0.5. A rate
needs 5 sessions under it in a 4-week window before it shows. A change needs 10 sessions in each
window, except Sessions per week, which counts itself. A comparison needs 8 weeks since that
measure's data began; a quiet week after that counts as a quiet week.

Kinds of work, from each session's opening message: Prototyping, Creating, Research,
Brainstorming, Career, Consultation (the page calls this one Advice).

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
- **Automation.** A request typed 3+ times belongs in a skill, a hook or a schedule. Claude
  Code docs on hooks, scheduled tasks and `/loop`; the Codex docs on scheduled tasks and
  `codex exec`. Check the current docs during the release scan before naming a command.

## Log

Locally, append to `~/.second-look/log.md` after each review. On claude.ai, put the same
entry in a Log section at the end of the report.

```
## 2026-10-25 (covers Oct 12 – 25)            ← add "(scoped)" for scoped reviews
Skills: 1 stale · 3 review · 3 current
Snapshot (last 4 weeks): 41 sessions a week · 52% briefed · 1.2 corrections/10 · 15% restarts · 7 rules retyped a week · 61% long-session usage
Repeats: 3 kept (job tracker summary ×6, voice rewrite ×5, report checker ×4) · 2 dropped
Report: <link or path>
Findings: P1 <one-liners> · P2 <count> · P3 <count>
Fixes: [ ] <fix> · [ ] <fix> · [ ] <fix>
Bets: <fix>: track <metric>; keep if <rule>; check <date>   (one line per fix)
```

The next review reads the open boxes. If a finding shows up in three reviews running, say
so and suggest a structural fix (a hook, a skill, a template) in place of more advice. When a
repeat from the log stops appearing after its fix, say so in "Did the fixes from your last review work?".

## Rules

- Quote their real prompts and skill lines. Never invent examples. If evidence is thin, say so.
- Trim quotes. Never show secrets, emails, keys or other people's private details.
- Be direct about weak spots. No flattery.
- Never edit their files, or set up a schedule, hook or skill, without a yes. Propose exact edits.
- Ask a clarifying question when their intent is unclear.
- Tables for comparisons. Bullets only for list-shaped content.
