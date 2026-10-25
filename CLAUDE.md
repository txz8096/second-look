# second look

@AGENTS.md

A reflection coach for how people work with AI, shipped as an Agent Skill. This repo holds
two things:

| Path | What |
|---|---|
| `plugin/skills/second-look/` | The skill: `SKILL.md`, `scripts/collect.py`, `scripts/check_report.py`, `report-template.html`, `references/design-system.md`, `logo.svg` |
| `plugin/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | Claude Code plugin + marketplace (install id `second-look@second-look`) |
| `install.sh` | Installs to `~/.agents/skills/second-look` (Codex and Cursor both read it); `--claude`, `--keep-history`, `--uninstall` |
| `src/` | The landing page (Next.js, deployed to GitHub Pages on push to `main`) |

## Commands

```bash
claude plugin validate .                                   # marketplace + plugin manifests
python3 plugin/skills/second-look/scripts/check_report.py plugin/skills/second-look/report-template.html
python3 plugin/skills/second-look/scripts/collect.py --days 14          # your own logs
python3 plugin/skills/second-look/scripts/collect.py --days 14 --home /tmp/empty   # must not crash
HOME=/tmp/fake bash install.sh --claude --keep-history && HOME=/tmp/fake bash install.sh --uninstall
# piped install against a local branch:
HOME=/tmp/fake SECOND_LOOK_REPO=file://$PWD SECOND_LOOK_REF=<branch> bash < install.sh
npx tsc --noEmit && npx eslint src                          # site
npm run dev                                                  # site preview
```

Scripts use the Python standard library only. Keep it that way so installs need nothing.

## How the skill works

1. First run asks four questions and writes `~/.second-look/profile.md` (name, what they
   build, focus areas, context file, skill folders). All state lives in `~/.second-look/`.
2. Skill freshness: inventory, fact check against the context file, release scan scoped to
   the profile's focus, health check, tests, status per skill.
3. Habit evidence: `collect.py` reads Claude Code, Codex and Cursor logs (and claude.ai /
   ChatGPT exports for the yearly view) and prints JSON. Numbers come from wording
   heuristics; the coach spot-checks `label_samples` before trusting them.
4. Report built from `report-template.html`, checked by `check_report.py`, then published
   privately or saved to `~/.second-look/reports/`.
5. Runs every two weeks (if scheduled) or on demand for any window or project.

## Report design rules

`report-template.html` is the source of truth. `check_report.py` hashes its `<style>` block
and fails any report whose styles differ, so the design can only change through the
template. To change the design: edit the template, update
`references/design-system.md`, update the forbidden/required lists in `check_report.py` if
needed, and keep the template passing the check.

Structure, in order: logo + tagline → summary paragraph (the year's story) → "This cycle at
a glance" (5 stats, "Comparing <window> to <previous window>", one-line meaning each) →
"Improve your prompts and context" (pattern cards with Evidence | Why it matters and a
"Try this" block, then compare table and plan) → "Keep your skills current" → "How your
behavior is changing" (last cycle's results only after a review with logged fixes; yearly
charts; usage) → footer.

Style: dark only (`#16181D`, text `#F2F3F5`, accent Proof Pink `#F2A7B8`); Familjen
Grotesk, headings 700 / -0.025em; IBM Plex Mono for code; radii 4/6/8/12/20/pill.
Status colours mark states (broken, stale, kept), never grade the user's habits: changes in
their numbers are plain text.

### Removed on purpose, after testing with a real user. Don't bring back.

| Removed | Why |
|---|---|
| Goals box and "Personalize goals" | It only reordered sections; the coach never used the goals |
| Slot labels (Change now / Practice / Explore) | Confusing; nobody knew what they meant |
| "How sure" rows and "How we know this" in cards | The how-sure chip is enough |
| "How we'll know it worked" in Try this blocks | Too long; the bet and keep-if rule live in the log instead |
| Part numerals, Expand/Collapse all, sample-data chips, bullet dots in chips | Visual noise |
| Divider lines between cards inside a part | Clutter; dividers only between major sections |
| Light theme, green/red on habit changes | Brand is dark; colour shouldn't judge the person |

Chip labels are fixed (see `design-system.md`); intuitive words beat jargon
("Clear pattern", not "Strong evidence").

## Writing style for the skill and report

Plain, direct, short sentences. Start with the answer. No filler, no buzzwords. Every
number says what it means. Tables for comparisons; bullets only for list-shaped content.

## Privacy

- Never commit real prompts, session logs, `~/.second-look` contents or anyone's personal
  details. The template uses a fictional project ("Tally") and made-up skills.
- Reports quote real prompts with secrets and emails removed (`SECRET` regex in
  `collect.py`). Keep that redaction when touching the collector.
- `CLAUDE.local.md` (gitignored) is for the maintainer's private notes.

## Open work

- `src/components/SampleReport.tsx` hand-copies the sample patterns; keep it in step with
  `report-template.html` or generate it from the template.
- claude.ai support: chats are only read from exports; no live path.
- "Did last cycle's fixes work?" depends on the coach parsing `log.md` `Bets:` lines; no
  script does this yet.
- No evals for the skill itself. Good first set: first-run setup, an on-demand window, a
  report that must pass `check_report.py`, an empty-logs run.
- Scheduling is documented (scheduled task or cron with `claude -p`) but not automated.
- `next build` needs network access to Google Fonts.
