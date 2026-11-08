# second look

**A performance review for how you work with AI.**

second look is a free, open-source skill for people who use AI to build things. It
reviews your past sessions, shows where your workflow could improve, and gives you
specific changes to try. The next review checks how those changes held up.

[See a sample report](https://txz8096.github.io/second-look/sample-report.html) ·
[Check supported apps](#supported-apps) ·
[Privacy](#privacy)

<a id="try-your-first-review"></a>

## Try second look

Open Claude Code, Codex or Cursor on the computer where you use it and paste this prompt.

```text
Install second look from github.com/txz8096/second-look.
```

Once it's installed, ask for **"a second look."** Answer four short questions to
get your first report. second look reads the session history your supported
coding tools already save.

**Free and open source.** Reviews use your existing AI quota.

**Only use AI in the browser?** [Set up second look in claude.ai](#claudeai).

<a id="what-you-get"></a>

## What a review shows you

In the sample report, 14 of 72 Claude Code and Codex sessions were very long and
accounted for 61% of usage over four weeks. Some continued into a new project
after the previous task was done. The suggested fix is to open a fresh chat
when you switch projects.

- **How you brief AI and set up your apps.** See where a missing detail slowed you down,
  where a standing rule could help, or when to start a fresh session.
- **Keep your skills current.** Find stale instructions, broken or duplicate skills,
  and updates you may have missed.
- **How your habits are changing.** See how often you check the work, where you might
  turn a recurring task into a skill, hook or scheduled task, and how those habits
  change over time.

Each finding shows evidence from your sessions and gives you a fix to try.
The [sample report](https://txz8096.github.io/second-look/sample-report.html) uses made-up sessions.

<a id="supported-tools"></a>

## Supported apps

Start a review from Claude Code, Codex or Cursor, and one run covers every source below
that's on that computer.

| App | What's read | Setup needed | How far back |
|---|---|---|---|
| **Claude Code** | Session logs in `~/.claude/projects`, your skills and `CLAUDE.md` | None. The installer links the skill in | Last 30 days only, unless you raise `cleanupPeriodDays` in `~/.claude/settings.json` |
| **Codex** | Session logs in `~/.codex/sessions`, your skills and `AGENTS.md` | None. The installer links the skill in | Full history |
| **Cursor** | Chats in Cursor's local database, plus `.cursor/rules` | None. The installer links the skill in | Full history |
| **Antigravity** | Agent transcripts in `~/.gemini/antigravity-cli`, plus `~/.gemini/GEMINI.md` | None. Reviews start from one of the apps above | Whatever the CLI keeps on disk. Support is new, and app chats may be missing |
| **claude.ai** | `conversations.json` from your data export | Optional. [Add your export](#add-your-claudeai-chatgpt-and-gemini-history) | Up to your export date |
| **ChatGPT** | `conversations.json` from your data export | Optional. [Add your export](#add-your-claudeai-chatgpt-and-gemini-history) | Up to your export date |
| **Gemini** | `MyActivity.json` from a Google Takeout export of your Gemini Apps activity | Optional. [Add your export](#add-your-claudeai-chatgpt-and-gemini-history) | Chats saved with Gemini Apps Activity on, up to your export date |

## Privacy

For local reviews, second look reads session logs, skill files and configuration
on your computer and saves the report in `~/.second-look/`. second look has no
server or account. Your assistant sends what it reads to your model provider
under your existing account settings.

You can limit a review to an app, project or date range. Pattern-based redaction
removes common secrets before quoting sessions, so read the report before
sharing it.

<details>
<summary>Inspect what the collector reads</summary>

Both [collect.py](plugins/second-look/skills/second-look/scripts/collect.py) and
[check_report.py](plugins/second-look/skills/second-look/scripts/check_report.py)
use Python's standard library and make no network calls.

```bash
python3 ~/.agents/skills/second-look/scripts/collect.py --days 14
```

Using AI apps at work? Check your company's AI policy before reviewing work sessions.

</details>

<a id="install"></a>

## Installer reference

### For AI assistants

<details>
<summary>Installer instructions for assistants</summary>

If a user asks you to install second look, follow these steps. Don't skip the first two.

1. Run the installer in check mode. It changes nothing.

   ```bash
   curl -fsSL https://raw.githubusercontent.com/txz8096/second-look/main/install.sh | bash -s -- --check
   ```

2. Show the user its output: the apps and exports it found, and what the install will
   change. If it lists the question about Claude Code's history setting, ask the user
   yourself. The installer can't prompt them from your shell.
3. Run the installer with the flag that matches their answer: `--yes` to keep a year of
   Claude Code history, or `--no-retention` to leave it alone.

   ```bash
   curl -fsSL https://raw.githubusercontent.com/txz8096/second-look/main/install.sh | bash -s -- --yes
   ```

4. Tell the user what was installed and where, and that they can start a review by asking
   for "a second look" or typing `/second-look` in Claude Code. Mention that adding their
   claude.ai, ChatGPT and Gemini exports is optional ([add browser history](#add-your-claudeai-chatgpt-and-gemini-history)).

</details>

<a id="claudeai"></a>

<details>
<summary>Browser setup in claude.ai</summary>

1. Download [`second-look.zip`](https://github.com/txz8096/second-look/releases/latest/download/second-look.zip).
2. In claude.ai, go to Settings > Capabilities, turn on code execution, and upload the zip
   under Skills.
3. Turn on chat search and memory so second look can read past chats and remember your
   profile.

Run a review in claude.ai by asking for "a second look." It covers your claude.ai
chats. To include ChatGPT or Gemini history, add an export to a local review.

</details>

## Add your claude.ai, ChatGPT and Gemini history

<details>
<summary>Add optional browser exports</summary>

You can add browser history any time, including after your first local review.

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

</details>

## Run it

Ask for "a second look" any time, or type `/second-look` in Claude Code. You can
narrow the review by asking for "just my Cursor sessions" or "since Oct 1".

After your first report, you can opt into a review every two weeks or choose
another cadence. [Scheduling options](#faq) depend on where you run the skill.

## FAQ

<details>
<summary><b>Do I need to install it in every app?</b></summary>

No. The installer puts one copy on your computer and links it into each app you have. A
review runs in the app where you start it, and it reads every app's files from there.
</details>

<details>
<summary><b>Which AI apps does it support?</b></summary>

Seven. Claude Code, Codex and Cursor can run a review and are read directly. Antigravity is
read directly but can't start a review, so start one from another app on the same computer.
claude.ai, ChatGPT and Gemini (the web app) are read from data exports you download, so they
count up to the day you export. Gemini's export has no conversation boundaries, so its
sessions are grouped by time and its numbers are estimates. Antigravity support is new and
built on an undocumented file format, so a release that changes it can hide your sessions
until second look is updated.
</details>

<details>
<summary><b>Does one report cover all my AI apps?</b></summary>

Yes, if you start it from Claude Code (terminal or desktop app), Codex or Cursor on the
computer where you use them. One run reads their logs and Antigravity's, plus claude.ai,
ChatGPT and Gemini if you add their data exports. A review started in claude.ai
covers your claude.ai chats. Local coding sessions need a review on the computer
where their logs are saved.
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

Every two weeks works well. Each review checks last cycle's experiments, then gives a fix for
every new pattern. You can also ask for a review any time; it covers everything since the last
one. Name a narrower scope, like "my Cursor sessions", if that's all you want.
</details>

<details>
<summary><b>Does it run by itself? Can I change or stop it?</b></summary>

Yes, if you say yes after your first report. In the Claude desktop app or the Codex app, a
scheduled task runs the full review on your computer. In a terminal, a small daily job runs
it in the background and tells you when the report is ready. Either way, ask for a second look
to open the finished report. In Cursor you get a reminder to start the review. For Antigravity history,
set up reviews from Claude Code, Codex or Cursor on the same computer. Every scheduled review includes Antigravity sessions and your exports, and the
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
| Antigravity | No | A notification when a review is due; start it from Claude Code, Codex or Cursor. Any scheduled review includes your Antigravity sessions | Computer on, and one of those apps installed |
| claude.ai | Yes, claude.ai only | A claude.ai scheduled task. It can't see your coding apps | Chat search on |
| ChatGPT | No | Reviews don't run here. Its history comes in through the data export | A `conversations.json` export |
| Gemini (web app) | No | Reviews don't run here. Its history comes in through the Takeout export, and you're reminded when it's 90 days old | A `MyActivity.json` export |
</details>

<details>
<summary><b>How far back does the yearly view go?</b></summary>

As far as your logs do. Claude Code keeps 30 days by default, which is why the installer
offers to keep a year. claude.ai, ChatGPT and Gemini count up to the day you export. Each run saves
weekly totals, so weeks your apps later delete stay in the trend.
</details>

<details>
<summary><b>Does it show where my token usage goes?</b></summary>

For Claude Code and Codex, the only apps that log tokens. The charts track how much of your
usage came from very long sessions, where every request re-reads a long history. The skills
check names what loads into every session before you type, like skills you haven't run in 60
days, and how much you'd save by having them run only when you ask. Numbers compare you with
your own typical session, never with other people. A full breakdown appears only if you keep
hitting usage limits. Usage is weighted by public list prices, so treat it as an estimate.
</details>

<details>
<summary><b>How accurate are the findings?</b></summary>

They're estimates read from the wording of your sessions. Each finding shows its examples and
how sure the review is (Sure, Likely or Hunch). Before trusting a
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
