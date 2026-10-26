# second look

**Learn from how you work with AI.**

second look is an open-source skill that reviews your sessions across Claude Code, Codex,
Cursor, claude.ai and ChatGPT, then suggests a few changes to test. Each suggestion cites the
sessions it came from.

**Learn more on the website: [txz8096.github.io/second-look](https://txz8096.github.io/second-look/)**

[Website](https://txz8096.github.io/second-look/) ·
[Sample report](https://txz8096.github.io/second-look/#sample-report) ·
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

Whenever you ask, second look builds one private report in three parts. If you like, a
reminder on your computer nudges you to run one every two weeks.

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

## Privacy

second look has no server and no account. It runs inside the assistant you already use,
reads files on your computer, and saves its report next to them.

```
Your files  ──▶  Your assistant  ──▶  Your model provider
```

| | |
|---|---|
| **Your files** | `~/.claude`, `~/.codex`, Cursor's database, and the exports you add. Read only when you ask for a review |
| **Your assistant** | Claude Code, Codex or Cursor runs the review on your computer and writes the report to `~/.second-look` |
| **Your model provider** | Sees what the review reads, like any message you send your assistant, under your existing account settings |

There are no second look servers. Nothing about your sessions is sent to us.

**What it reads.** Claude Code, Codex and Cursor logs on this computer, the exports you add,
and your skill files. To see the list for your machine without changing anything:

```bash
curl -fsSL https://raw.githubusercontent.com/txz8096/second-look/main/install.sh | bash -s -- --check
```

**What gets removed.** API keys, emails, and token or password values are stripped before
anything is quoted. It works by pattern, so it won't catch a client's name or confidential
code. Read a report before you share it.

**Who sees the report.** Only you. It's saved in `~/.second-look/` or published as a private
artifact, and it's shared only if you choose to.

**What you can leave out.** Scope any review to a window, a tool or a project: "only my
Cursor sessions", "since Oct 1".

**Check it yourself.** Everything is in this repo. The two scripts,
[`collect.py`](plugins/second-look/skills/second-look/scripts/collect.py) and
[`check_report.py`](plugins/second-look/skills/second-look/scripts/check_report.py), use
Python's standard library and make no network calls. To see exactly what your assistant will
read, run the collector yourself from the installed skill:

```bash
python3 ~/.agents/skills/second-look/scripts/collect.py --days 14
```

**Delete it any time.** Turn off the reminder, then remove `~/.second-look/` and the skill folder (see
[How do I uninstall it?](#faq)). If you kept a year of Claude Code history, set
`cleanupPeriodDays` back to `30` in `~/.claude/settings.json`.

Using AI tools at work? Check your company's AI policy before you review work sessions.
Keeping a year of history also means more of it stays on your disk, which is why the
installer asks before changing that.

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
5. Asks whether to remind you to run a review every 14 days, or at another interval. The
   reminder is a notification from a small daily job on your computer (launchd on macOS,
   cron on Linux). It never runs a review by itself.

It needs `python3`, which macOS and most Linux systems already have. Pass `--yes` to accept
the retention change without a prompt, or `--no-retention` to skip it. Pass `--remind 14`
(or another number of days) to set the reminder, or `--no-remind` to skip it. To see what it found
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
   change. It may list two questions: Claude Code's history setting and a review reminder.
   Ask the user each one yourself. The installer can't prompt them from your shell.
3. Run the installer with the flags that match their answers: `--yes` to keep a year of
   Claude Code history or `--no-retention` to leave it alone, and `--remind 14` (or the
   number of days they chose) or `--no-remind`.

   ```bash
   curl -fsSL https://raw.githubusercontent.com/txz8096/second-look/main/install.sh | bash -s -- --yes --remind 14
   ```

4. Tell the user what was installed and where, and that they can start a review by asking
   for "a second look" or typing `/second-look` in Claude Code. Mention that adding their
   claude.ai and ChatGPT exports is optional (see below).

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

## Add your claude.ai and ChatGPT history

This step is optional. You can add it any time.

| App | Where | Put `conversations.json` in |
|---|---|---|
| claude.ai | Settings > Privacy > Export data | `~/.second-look/exports/claude/` |
| ChatGPT | Settings > Data controls > Export data | `~/.second-look/exports/chatgpt/` |

Each app emails you a zip, usually within a day.

## Run it

Ask your assistant for "a second look", or type `/second-look` in Claude Code. The first run
asks four questions to set up your profile.

In the Claude desktop app, second look offers to run the full review every two weeks as a
scheduled task. Elsewhere, if you turned on the reminder, a notification tells you when a
review is due. To change it,
ask your assistant: "remind me every 3 weeks", "remind me monthly" or "stop the
reminders". Reviews only run when you ask for one.

## FAQ

<details>
<summary><b>Do I need to install it in every tool?</b></summary>

No. The installer puts one copy on your computer and links it into each tool you have. A
review runs in the tool where you start it, and it reads every tool's files from there.
</details>

<details>
<summary><b>Does one report cover all my AI tools?</b></summary>

Yes, if you start it from Claude Code (terminal or desktop app), Codex or Cursor on the
computer where you use them. One run reads all three tools' logs, plus claude.ai and ChatGPT
if you add their data exports. Started from claude.ai in a browser or from a cloud session,
it can't see those logs, so it covers only your claude.ai chats.
</details>

<details>
<summary><b>What data does it read?</b></summary>

Only what's on your computer or what you hand it: local Claude Code, Codex and Cursor logs,
the claude.ai and ChatGPT exports you download yourself, and your skill and config files for
the skills check. Sources it can't open are marked "Not checked" in the report.
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
three new ones. You can also run it any time for a window you name, like "since Oct 1" or
"my Cursor sessions", without moving your reminder.
</details>

<details>
<summary><b>Does it run by itself? Can I change or stop the reminder?</b></summary>

Only if you use the Claude desktop app. There, second look can set up a scheduled task that
runs the full review on your Mac every two weeks, as a session you open afterwards to read
the report and pick fixes. It uses your quota each time and runs while the app is open.

Everywhere else it never runs a review by itself. If you turn on the reminder, a small daily
job on your computer shows a notification when a review is due, then again every two days
until you run one. Ask your assistant to change the interval ("remind me monthly") or turn it off ("stop
the reminders"). The reminder needs your computer to be on, and works on macOS and Linux.
</details>

<details>
<summary><b>How far back does the yearly view go?</b></summary>

As far as your logs do. Claude Code keeps 30 days by default, which is why the installer
offers to keep a year. claude.ai and ChatGPT count up to the day you export. Each run saves
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

First turn off the reminder, if you set one:
`python3 ~/.agents/skills/second-look/scripts/reminder.py off`. Then delete
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

Found a problem? [Open an issue](https://github.com/txz8096/second-look/issues).

## License

MIT
