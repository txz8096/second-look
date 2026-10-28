# second look

**Learn from how you work with AI.**

second look is an open-source skill that reviews your sessions across Claude Code, Codex,
Cursor, Antigravity, claude.ai, ChatGPT and Gemini, then suggests a few changes to test.
Each suggestion cites the sessions it came from.

**Learn more on the website: [txz8096.github.io/second-look](https://txz8096.github.io/second-look/)**

[Website](https://txz8096.github.io/second-look/) ·
[Sample report](https://txz8096.github.io/second-look/#sample-report) ·
[Supported tools](#supported-tools) ·
[Install](#install) ·
[Privacy](#privacy) ·
[FAQ](#faq)

## Why

AI use is more than the prompt you type. It's also the context you give, the skills and
config you've built, and habits that drift without you noticing. Most of that is invisible
from inside a single chat. second look reads across all of it and hands back a short list of
things to try, each with the evidence behind it.

A closer look pays off in a few places:

| | |
|---|---|
| **Less overhead** | Cut the setup and back-and-forth around each task |
| **Better first results** | Find the habits behind rework, so output needs less fixing |
| **More reliable code** | Ask for code with a clear scope and a way to check it |
| **Your own judgment** | Notice when you accept polished output without checking it |
| **Less repeated setup** | Stop retyping the same rules. Move them into memory and skills |
| **Tools that work together** | See which tool you use for what, and match each task to the right one |
| **Skills that last** | Keep your skills accurate as models and tools change |

## What you get

Every two weeks, or whenever you ask, second look builds one private report in three parts.
After your first report, it offers to set up the two-week schedule for you.

**1. Improve your prompts and context.** It checks whether your first message gave the goal,
the audience, the constraints and what done looks like, and whether your standing rules
reach every tool. A finding looks like this:

> **Pattern:** Your prototype requests name the feature but leave out the user.
>
> **Evidence:** In three sessions, that cost several turns of clarifying.
>
> **Change to try:** Add who it's for and what done means to the first message.

Generic advice like "write clearer prompts" doesn't make the cut. Each card shows quotes from
your own sessions, how sure the review is, and a fix you can paste.

**2. Keep your skills current.** It reads the skills and config you've built and flags the
ones with wrong facts, broken folders, duplicates, missed updates from recent releases, and
no tests.

**3. See how your habits change.** Briefed starts, corrections, output checking and restarts,
charted week by week for up to 12 months and filterable by tool and kind of work. After your
first review, it also checks whether last cycle's fixes stuck and whether the work got
better.

See the [sample report](https://txz8096.github.io/second-look/#sample-report) for the full
layout. It uses made-up data.

## Supported tools

Start a review from Claude Code, Codex or Cursor, and one run covers every source below
that's on that computer.

| Tool | What's read | Setup needed | How far back |
|---|---|---|---|
| **Claude Code** | Session logs in `~/.claude/projects`, your skills and `CLAUDE.md` | None. The installer links the skill in | Last 30 days only, unless you raise `cleanupPeriodDays` in `~/.claude/settings.json` |
| **Codex** | Session logs in `~/.codex/sessions`, your skills and `AGENTS.md` | None. The installer links the skill in | Full history |
| **Cursor** | Chats in Cursor's local database, plus `.cursor/rules` | None. The installer links the skill in | Full history |
| **Antigravity** | Agent transcripts in `~/.gemini/antigravity-cli`, plus `~/.gemini/GEMINI.md` | None. Reviews start from one of the tools above | Whatever the CLI keeps on disk. Support is new, and app chats may be missing |
| **claude.ai** | `conversations.json` from your data export | Optional. [Add your export](#add-your-claudeai-chatgpt-and-gemini-history) | Up to your export date |
| **ChatGPT** | `conversations.json` from your data export | Optional. [Add your export](#add-your-claudeai-chatgpt-and-gemini-history) | Up to your export date |
| **Gemini** | `MyActivity.json` from a Google Takeout export of your Gemini Apps activity | Optional. [Add your export](#add-your-claudeai-chatgpt-and-gemini-history) | Chats saved with Gemini Apps Activity on, up to your export date |

## Privacy

second look has no server and no account. It runs inside the assistant you already use,
reads files on your computer, and saves its report to `~/.second-look/`. Nothing about your
sessions is sent to us. What the review reads goes to your model provider like any message
you send your assistant, under your existing account settings.

| | |
|---|---|
| **Redaction** | API keys, emails, and token or password values are stripped before anything is quoted. It works by pattern, so it can miss a client's name or confidential code. Read a report before you share it |
| **Scope** | Limit any review to a window, a tool or a project: "only my Cursor sessions", "since Oct 1" |
| **Sharing** | Reports stay private unless you share them |
| **Deleting** | Stop recurring reviews, then remove `~/.second-look/` and the skill folder ([How do I uninstall it?](#faq)). If you kept a year of Claude Code history, set `cleanupPeriodDays` back to `30` |

Both scripts, [`collect.py`](plugins/second-look/skills/second-look/scripts/collect.py) and
[`check_report.py`](plugins/second-look/skills/second-look/scripts/check_report.py), use
Python's standard library and make no network calls. To see exactly what your assistant will
read, run the collector yourself:

```bash
python3 ~/.agents/skills/second-look/scripts/collect.py --days 14
```

Using AI tools at work? Check your company's AI policy before you review work sessions.

## How it works

| Step | What happens |
|---|---|
| **Coach this cycle** | Pick up to three patterns to test. The rest waits |
| **Maintain your setup** | Fix stale, broken or duplicate skills and config |
| **Review change over time** | Compare habits and outcomes across tools |
| **Return to the evidence** | Next review: did it stick, did it help, and what did it cost? |

Compared with other AI reflection tools, second look covers several tools in one report,
checks your skills and config as well as your prompts, and follows up on whether last
cycle's changes worked.

## Install

### Ask your assistant (easiest)

Paste this into Claude Code, Codex or Cursor:

```
Install second look from github.com/txz8096/second-look.
```

Your assistant follows the steps in [For AI assistants](#for-ai-assistants): it shows you
which tools it found and asks before changing anything.

### Terminal

```bash
curl -fsSL https://raw.githubusercontent.com/txz8096/second-look/main/install.sh | bash
```

The installer:

1. Copies the skill to `~/.agents/skills/second-look`.
2. Links it into `~/.claude/skills`, `~/.codex/skills` and `~/.cursor/skills` for each tool
   you have.
3. Asks before changing one setting. Claude Code deletes sessions after 30 days by default,
   and a 12-month view needs them kept for a year (`cleanupPeriodDays: 365`).
4. Creates `~/.second-look/` for your profile, review log and exports.

It needs `python3`, which macOS and most Linux systems already have. Pass `--yes` to accept
the retention change without a prompt, or `--no-retention` to skip it. To see what it found
and what it would change without changing anything, run it with `--check`:

```bash
curl -fsSL https://raw.githubusercontent.com/txz8096/second-look/main/install.sh | bash -s -- --check
```

### For AI assistants

If a user asks you to install second look, follow these steps. Don't skip the first two.

1. Run the installer in check mode. It changes nothing.

   ```bash
   curl -fsSL https://raw.githubusercontent.com/txz8096/second-look/main/install.sh | bash -s -- --check
   ```

2. Show the user its output: the tools and exports it found, and what the install will
   change. If it lists the question about Claude Code's history setting, ask the user
   yourself. The installer can't prompt them from your shell.
3. Run the installer with the flag that matches their answer: `--yes` to keep a year of
   Claude Code history, or `--no-retention` to leave it alone.

   ```bash
   curl -fsSL https://raw.githubusercontent.com/txz8096/second-look/main/install.sh | bash -s -- --yes
   ```

4. Tell the user what was installed and where, and that they can start a review by asking
   for "a second look" or typing `/second-look` in Claude Code. Mention that adding their
   claude.ai, ChatGPT and Gemini exports is optional (see below).

### Claude Code plugin

```
/plugin marketplace add txz8096/second-look
/plugin install second-look@second-look
```

The plugin installs the skill for Claude Code only. Use the installer above to add Codex and
Cursor, or to change the retention setting.

### claude.ai

1. Download [`second-look.zip`](https://github.com/txz8096/second-look/releases/latest/download/second-look.zip).
2. In claude.ai, go to Settings > Capabilities, turn on code execution, and upload the zip
   under Skills.
3. Turn on chat search and memory so second look can read past chats and remember your
   profile.

On claude.ai it can read your claude.ai chats only. Run it in Claude Code, Codex or Cursor
to include those tools.

## Add your claude.ai, ChatGPT and Gemini history

This step is optional. You can add it any time.

| App | Get your export | Then tell your assistant |
|---|---|---|
| claude.ai | Settings > Privacy > Export data | "add my claude.ai export" |
| ChatGPT | Settings > Data controls > Export data | "add my ChatGPT export" |
| Gemini | takeout.google.com > My Activity, filtered to Gemini Apps, format JSON | "add my Gemini export" |

Each app sends you a zip, usually within a day. Download it, and your assistant finds it in
Downloads or Desktop, checks which app it came from, and files it. You can also drag the zip
into the chat. For Gemini, pick "My Activity" rather than "Gemini", which exports your Gems
only. It includes chats saved while Gemini Apps Activity was on.

To file one by hand instead, put `conversations.json` in `~/.second-look/exports/claude/` or
`~/.second-look/exports/chatgpt/`, and Gemini's `MyActivity.json` in
`~/.second-look/exports/gemini/`.

## Run it

Ask your assistant for "a second look", or type `/second-look` in Claude Code. The first run
asks four questions to set up your profile.

Every review covers all your tools since the last one. To narrow it, say so: "just my Cursor
sessions" or "since Oct 1".

After your first report, second look asks whether to run the review every two weeks, or at
another cadence, and sets it up with the best option where you are:

| Where you use it | How the review recurs |
|---|---|
| Claude desktop app, Codex app | A scheduled task in the app runs the full review on your computer. You open it afterwards to read the report and pick fixes |
| Terminal (Claude Code or Codex CLI) | A small daily job runs the review in the background when it's due, then notifies you the report is ready |
| Cursor, or if you'd rather not run reviews unattended | A notification tells you a review is due |
| claude.ai | A claude.ai scheduled task, which only sees your claude.ai chats |

Scheduled reviews read your sessions and use your quota each time, and need your computer on.
To change or stop them, ask your assistant: "make it monthly" or "stop the reviews".

## FAQ

<details>
<summary><b>Do I need to install it in every tool?</b></summary>

No. The installer puts one copy on your computer and links it into each tool you have. A
review runs in the tool where you start it, and it reads every tool's files from there.
</details>

<details>
<summary><b>Which AI apps does it support?</b></summary>

Seven. Claude Code, Codex and Cursor can run a review and are read directly. Antigravity is
read directly but can't start a review, so start one from another tool on the same computer.
claude.ai, ChatGPT and Gemini (the web app) are read from data exports you download, so they
count up to the day you export. Gemini's export has no conversation boundaries, so its
sessions are grouped by time and its numbers are estimates. Antigravity support is new and
built on an undocumented file format, so a release that changes it can hide your sessions
until second look is updated.
</details>

<details>
<summary><b>Does one report cover all my AI tools?</b></summary>

Yes, if you start it from Claude Code (terminal or desktop app), Codex or Cursor on the
computer where you use them. One run reads their logs and Antigravity's, plus claude.ai,
ChatGPT and Gemini if you add their data exports. Started from claude.ai in a browser or from a cloud session,
it can't see those logs, so it covers only your claude.ai chats.
</details>

<details>
<summary><b>What data does it read?</b></summary>

Only what's on your computer or what you hand it: local Claude Code, Codex, Cursor and
Antigravity logs, the claude.ai, ChatGPT and Gemini exports you download yourself, and your
skill and config files for the skills check. Sources it can't open are marked "Not checked" in the report.
</details>

<details>
<summary><b>Where does it run, and is anything uploaded?</b></summary>

It runs on your machine, and reports are saved in `~/.second-look/`. Nothing goes to second
look, because there's no second look server. The review runs inside your assistant, so what
it reads goes to your model provider like any other message you send, under your existing
account settings. See [Privacy](#privacy).
</details>

<details>
<summary><b>What is redacted?</b></summary>

Prompts are trimmed, and API keys, emails, and token or password values are removed before
anything is quoted. This works by pattern, so it can miss things like a client's name.
Read a report before you share it.
</details>

<details>
<summary><b>What do I need to run it on claude.ai?</b></summary>

Turn on chat search, code execution and memory in Settings, and upload `second-look.zip`.
Without chat search or a `conversations.json` export, habit numbers show as "Not measured"
instead of a guess.
</details>

<details>
<summary><b>What happens the first time I run it?</b></summary>

It asks four short questions: what you build, which areas to watch for new releases, where
your standing rules live, and where your skills are. Your answers become a profile in
`~/.second-look/profile.md` that you can edit later.
</details>

<details>
<summary><b>How often should I run it?</b></summary>

Every two weeks works well. Each review checks last cycle's experiments, then suggests up to
three new ones. You can also ask for a review any time; it covers everything since the last
one. Name a narrower scope, like "my Cursor sessions", if that's all you want.
</details>

<details>
<summary><b>Does it run by itself? Can I change or stop it?</b></summary>

Yes, if you say yes after your first report. In the Claude desktop app or the Codex app, a
scheduled task runs the full review on your computer. In a terminal, a small daily job runs
it in the background and tells you when the report is ready. In Cursor or Antigravity, which
can't schedule anything on your computer, you get a notification when a review is due
instead. Every scheduled review includes Antigravity sessions and your exports, and the
notification tells you when an export is over 90 days old. Each run
uses your quota and needs your computer on. Ask your assistant to change the cadence ("make
it monthly") or stop it ("stop the reviews").
</details>

<details>
<summary><b>Which apps can run it on a schedule?</b></summary>

It depends on whether the app can run the review on your computer, because that's where your
session logs are.

| Where you use it | Runs by itself? | How it recurs | Needs |
|---|---|---|---|
| Claude desktop app | Yes | A scheduled task in the app runs the full review | The app open, computer on |
| Codex app | Yes | A scheduled task in the app runs the full review | The app open, computer on |
| Terminal (Claude Code or Codex CLI) | Yes | A daily job runs the review in the background, then tells you the report is ready | Computer on; file access approved in advance |
| Cursor | No | A notification when a review is due; you start it | Computer on (macOS or Linux) |
| Antigravity | No | A notification when a review is due; start it from Claude Code, Codex or Cursor. Any scheduled review includes your Antigravity sessions | Computer on, and one of those tools installed |
| claude.ai | Yes, claude.ai only | A claude.ai scheduled task. It can't see your coding tools | Chat search on |
| ChatGPT | No | Reviews don't run here. Its history comes in through the data export | A `conversations.json` export |
| Gemini (web app) | No | Reviews don't run here. Its history comes in through the Takeout export, and you're reminded when it's 90 days old | A `MyActivity.json` export |
</details>

<details>
<summary><b>How far back does the yearly view go?</b></summary>

As far as your logs do. Claude Code keeps 30 days by default, which is why the installer
offers to keep a year. claude.ai, ChatGPT and Gemini count up to the day you export. Each run saves
weekly totals, so weeks your tools later delete stay in the trend.
</details>

<details>
<summary><b>How accurate are the findings?</b></summary>

They're estimates read from the wording of your sessions. Each finding shows its examples and
how sure the review is (Clear pattern, Likely pattern or Unconfirmed). Before trusting a
number, the review spot-checks a sample of its own labels, and you can correct a label at the
next review.
</details>

<details>
<summary><b>Can I edit or delete the report?</b></summary>

Yes. The report, your profile, the review log and your history are plain files in
`~/.second-look/`. Edit or delete them whenever you like.
</details>

<details>
<summary><b>How do I uninstall it?</b></summary>

First stop recurring reviews, if you set them up: ask your assistant to "stop the reviews",
or run `python3 ~/.agents/skills/second-look/scripts/schedule.py off`. Then delete
`~/.agents/skills/second-look` and the `second-look` links in `~/.claude/skills`,
`~/.codex/skills` and `~/.cursor/skills`. Delete `~/.second-look/` too if you don't want to
keep your reports. If you used the plugin, run `/plugin uninstall second-look`.
</details>

## What's in the repo

| Path | What it is |
|---|---|
| `plugins/second-look/skills/second-look/` | The skill: `SKILL.md`, the report template, the design system and the scripts |
| `install.sh` | The installer |
| `.claude-plugin/marketplace.json` | Lets Claude Code install this repo as a plugin |
| `src/` | The [website](https://txz8096.github.io/second-look/) (Next.js, deployed to GitHub Pages) |

To work on the website: `npm install`, then `npm run dev`.

Found a problem? [Open an issue](https://github.com/txz8096/second-look/issues/new).

## License

MIT
