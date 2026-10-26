# second look

Learn from the way you work with AI.

second look is a skill that reviews your sessions in Claude Code, Codex, Cursor, claude.ai
and ChatGPT. Every two weeks, or whenever you ask, it builds a private report with:

- **Your prompts and context.** Patterns that cost you time, each with the evidence from
  your own sessions and one fix to try.
- **Your skills.** Which ones have wrong facts, which missed a useful update, and which
  have no tests.
- **Your habits over 12 months.** Briefed starts, corrections, output checking and restarts,
  week by week, and whether last cycle's fixes worked.

Everything is read on your computer. Nothing is uploaded unless you publish a report.

## Install

### Ask your assistant (easiest)

Paste this into Claude Code, Codex or Cursor:

```
Install second look from github.com/txz8096/second-look. Run its install.sh, and tell me which folders it will read before you change anything.
```

### Terminal

```bash
curl -fsSL https://raw.githubusercontent.com/txz8096/second-look/main/install.sh | bash
```

The installer:

1. Copies the skill to `~/.agents/skills/second-look`.
2. Links it into `~/.claude/skills`, `~/.codex/skills` and `~/.cursor/skills` for each tool
   you have.
3. Asks before changing one setting: Claude Code deletes sessions after 30 days by default,
   and a 12-month view needs them kept for a year (`cleanupPeriodDays: 365`).
4. Creates `~/.second-look/` for your profile, review log and exports.

It needs `python3`, which macOS and most Linux systems already have. Pass `--yes` to accept
the retention change without a prompt, or `--no-retention` to skip it.

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
asks four questions to set up your profile. To run it every two weeks, ask your assistant to
schedule it.

## What's in the repo

| Path | What it is |
|---|---|
| `plugins/second-look/skills/second-look/` | The skill: `SKILL.md`, the report template, the design system and the scripts |
| `install.sh` | The installer |
| `.claude-plugin/marketplace.json` | Lets Claude Code install this repo as a plugin |
| `src/` | The landing page (Next.js, deployed to GitHub Pages) |

To work on the landing page: `npm install`, then `npm run dev`.

## License

MIT
