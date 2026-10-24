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
| claude.ai, ChatGPT | Add your data export | `conversations.json` from each export |

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
