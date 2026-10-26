# second look

A reflection coach for how you work with AI. It reads your own sessions, finds patterns in
how you prompt and manage context, suggests one fix to try for each, checks whether the
skills you wrote have gone stale, and shows how your habits change over the year.

Everything runs on your computer through the AI tool you already use. Your sessions are
never uploaded anywhere.

## What you get

A report in three parts, plus an optional 30-minute walkthrough:

| Part | What it covers |
|---|---|
| Improve your prompts and context | Patterns such as vague starts, rules you retype, long sessions that drift, polished work accepted without a check. Each comes with evidence, why it matters, and a fix you can paste. |
| Keep your skills current | Skills with wrong facts, broken folders, duplicates, installed skills behind their source, and new releases that change how a skill should work. |
| How your behavior is changing | Briefed starts, corrections, restarts and more, by week, tool and kind of work, over up to 12 months. |

See [`plugin/skills/second-look/report-template.html`](plugin/skills/second-look/report-template.html)
for a sample report with made-up data.

## Supported tools

| Tool | Install | Reads |
|---|---|---|
| Claude Code | Plugin (below) | `~/.claude/projects` session logs |
| Codex | `install.sh` | `~/.codex/sessions` |
| Cursor | `install.sh` | Cursor's local chat database |
| claude.ai | Add the skill to your account (Settings → Capabilities → Skills) | Your past chats, via chat search; uploaded exports |
| ChatGPT | Add your data export | `conversations.json` from the export |

You need Python 3 for the log reader. The scripts use only the standard library.

## Install

### Claude Code

```bash
claude plugin marketplace add txz8096/second-look
claude plugin install second-look@second-look
```

Or inside a session: `/plugin marketplace add txz8096/second-look`, then
`/plugin install second-look@second-look`.

### Codex and Cursor

```bash
curl -fsSL https://raw.githubusercontent.com/txz8096/second-look/main/install.sh | bash
```

This copies the skill to `~/.agents/skills/second-look`, which both Codex and Cursor read.
Options:

| Flag | What it does |
|---|---|
| `--claude` | Also copy it to `~/.claude/skills` (Claude Code without the plugin) |
| `--keep-history` | Keep Claude Code transcripts for 365 days instead of 30, so the yearly view has data |
| `--uninstall` | Remove the installed copies; your `~/.second-look` data stays |

Pass flags after `bash -s --`, e.g. `curl -fsSL …/install.sh | bash -s -- --keep-history`.

### Optional: the 12-month view

Claude Code keeps 30 days of history by default. For a longer view, add your exports:

1. Export your data from claude.ai (Settings → Privacy) and ChatGPT (Settings → Data controls).
2. Put each `conversations.json` in `~/.second-look/exports/claude/` or
   `~/.second-look/exports/chatgpt/`.

## Use

Ask in any supported tool:

- "reflect on how I've been using AI"
- "review my AI conversations since Oct 1"
- "are my skills stale?"
- In Claude Code: `/second-look:second-look`

The first time, it asks four short questions (your name, what you build, what to watch for,
where your rules and skills live) and saves them to `~/.second-look/profile.md`.

### Run it every two weeks

Ask Claude to set up a scheduled task that runs second look every other Sunday, or add a cron
job that runs `claude -p "reflect on how I've been using AI over the last two weeks"`.

## FAQ

**Do I need to install it in every tool?**
No. Install it once, say in Claude Code, and it still reads your Codex and Cursor sessions
on the same computer, because it opens each tool's log files directly. Install it in another
tool only if you want to start reviews from there.

**Does running it in one tool start it in the others?**
No. Nothing runs in the background or between tools. A review runs only where you start it,
or when a schedule you set up fires. That one run reads every tool's files, and every run on
your computer shares the same notes in `~/.second-look`.

**Does one report cover all my AI tools?**
Yes, if you start it from Claude Code (terminal or desktop app), Codex or Cursor on the
computer where you use those tools. That one run reads all three tools' logs on that
computer. Started from claude.ai in a browser, or from a cloud session such as Claude Code on
the web, it can't see those logs.

| Source | Started from Claude Code, Codex or Cursor on your computer | Started from claude.ai |
|---|---|---|
| Claude Code | ✓ | ✗ |
| Codex | ✓ | ✗ |
| Cursor | ✓ | ✗ |
| claude.ai | From a data export | ✓ (a sample of recent chats) |
| ChatGPT | From a data export | If you upload the export |

**How far back does the yearly view go?**
As far back as your logs do. Claude Code keeps 30 days by default; `--keep-history` keeps a
year from then on. Codex and Cursor go back as far as their files. claude.ai and ChatGPT
count up to the day you exported. The sample report uses made-up data. To see what your own
data covers:

```bash
python3 ~/.agents/skills/second-look/scripts/collect.py --days 365 --trend \
  | python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin)['coverage'], indent=2))"
```

With only the Claude Code plugin installed, ask Claude Code to "run the second look collector
and show me the coverage" instead.

**Are cloud sessions included?**
No. Claude Code on the web, Codex cloud tasks and Cursor cloud agents don't leave logs on
your computer, so second look can't see them.

## Where your data goes

| Location | What |
|---|---|
| `~/.second-look/profile.md` | Your answers to the setup questions |
| `~/.second-look/log.md` | One entry per review, including the fixes you picked |
| `~/.second-look/history.json` | Weekly habit counts, kept after tools delete old logs |
| `~/.second-look/reports/` | Saved reports |

Reports quote your real prompts, with secrets and email addresses removed. They stay
private unless you choose to share one.

## How it works

- `plugin/skills/second-look/SKILL.md`: the coach's instructions
- `scripts/collect.py`: reads local logs and counts habits; prints JSON
- `scripts/check_report.py`: checks a report against the design before it's shown
- `report-template.html` and `references/design-system.md`: the report design

Habit numbers are read from wording, so treat them as estimates; the coach spot-checks
samples before trusting them. The rubric draws on Anthropic's
[AI Fluency Index](https://www.anthropic.com/research/AI-fluency-index),
[Claude Code best practices](https://www.anthropic.com/engineering/claude-code-best-practices)
and the [Agent Skills docs](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview).

## The website

The landing page lives in `src/` (Next.js) and deploys to GitHub Pages on every push to
`main`.

```bash
npm install
npm run dev
```

## License

MIT. See [LICENSE](LICENSE).
