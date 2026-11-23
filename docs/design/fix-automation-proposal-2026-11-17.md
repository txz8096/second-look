# Fixes as automations: proposal

Status: approved 2026-11-17 and built in `report-template.html`, `SKILL.md`, `references/design-system.md` and `scripts/check_report.py`. Not yet committed or released.

## What changes

Each fix on Briefs & setup becomes a proposal to set up a saved rule or a skill once, so the user stops having to remember a prompt. The card follows the approved Wonder pattern, Briefs And Setup Dark Matched: one line saying what the app will set up, the saving, a collapsed **View prompt**, and **Approve** / **Decline**.

- **Approve** opens a new session in Codex or Claude Code, with the prompt already typed in. Second Look picks whichever of the two apps has more of the user's sessions in the review window. The user reads it and presses send. The AI then shows the exact rule or skill and where it would save it in each app. It waits for the user's yes before saving anything. So the user approves twice: once on the report, then again on the actual change.
- **Decline** marks the card as declined. At the next review, that fix shows as "You declined this" rather than "Not tried yet".
- Not every fix becomes a rule or skill. A fix takes the form that fits it: a saved rule, a skill, hook or schedule, a settings change, or a one-time prompt or habit when only the user can act (briefing, opening a fresh session). A settings change reads current settings first, shows each change and waits for a yes. Updated 2026-11-17: `SKILL.md` and sample fix 5 now say this.
- Skills to fix and What you could automate next stay as they are.

## How Approve reaches the app

Both apps take a link that opens a new session with the prompt typed in but not sent:

| App | Link | Limit | Source |
|---|---|---|---|
| Codex | `codex://new?prompt=<encoded>` | None documented | [Codex app commands](https://developers.openai.com/codex/app/commands) |
| Claude Code in the Claude desktop app | `claude://code/new?q=<encoded>` | About 14,000 characters | [Open Claude desktop with a link](https://support.claude.com/en/articles/14729294-open-claude-desktop-with-a-link) |
| Claude Code in a terminal | `claude-cli://open?q=<encoded>` | 5,000 characters. A reported macOS bug drops links over about 700 characters | [Deep links](https://code.claude.com/docs/en/deep-links), [bug report](https://claudeissues.com/issue/81485-bug-macos-deep-links-silently-fail-when-the-launch-command-exceeds-1024-bytes-tt) |

Plan:
- The review picks the app and link type. It uses Codex, Claude desktop or terminal Claude Code, whichever has the most sessions. It writes that choice into the card as data.
- Approve also copies the prompt. If no app opens (link handler not registered, prompt too long, a browser that blocks custom links), the card says "Prompt copied. Paste it into a new <app> session."
- Prompts stay under 1,800 characters so they fit Codex and the desktop link. Terminal-only Claude Code users get Copy instead of a link, because of the 700-character bug.
- Users on claude.ai only see Copy, since claude.ai can't save a rule into the other apps.
- Decline lives in this browser only (`localStorage`), like the theme setting. The next review can't read it, so the walkthrough and the follow-up step use what the logs show. A declined fix with no trace in the logs reads "Not tried yet".

## The five sample fixes as automations

| # | Fix | Becomes | Apps |
|---|---|---|---|
| 1 | Fill the gaps in your saved rules | Saved rules (already this) | Codex, Claude Code, Cursor, claude.ai, ChatGPT |
| 2 | Brief before big prototype tasks | Saved rule (already this in Wonder) | Claude Code, Codex, Cursor, claude.ai |
| 3 | Check beta work before it ships | A skill that runs when they say "ship it" or "share with beta". It pairs with the pending Ship Checks skill preview | Claude Code, Codex |
| 4 | Start fresh between projects | Saved rule | Claude Code, Codex |
| 5 | Match the model to the job | Settings change: default model, helper agent models (no app picks a model per task) | Claude Code |

### Draft prompts for 3–5 (what View prompt shows)

**3. Ask Codex to set up a check that runs before beta work ships.**

```
Set up a skill called ship-checks in Codex and Claude Code. It should run when I say "ship it", "share this with beta" or ask whether work is ready for others.

When it runs:
- Name the type of work, then run the checks that fit it:
  - Anything beta users will see: list the 3 most likely ways it breaks for a real user, then check each. Use my pr-review skill if it works.
  - Facts for decisions or docs: cite sources and spot-check one.
  - Code changes: run it and say what it assumed.
  - Routine writing and formatting: no check.
- End with what passed, what failed and what is still unverified. Don't say the work is ready while something failed.

Before saving, check whether I already have a skill or rule that does this. Show me the full skill and where you'll save it in each app, and wait for my yes. After saving, read back what changed. For any app you can't update, give me the exact text and where to paste it. Tell me which apps to test in a fresh session.
```

**4. Ask Codex to set up a rule that offers a fresh start when you switch projects.**

```
Add this rule to my saved rules in Codex and Claude Code:

When I finish a piece of work or move to a different project in the same session, stop before starting the new work. Write a five-line handoff: goal, current state, relevant files, decisions, next step, including unfinished checks. Then suggest I open a new session and paste it. Continue here only if I say so.

Before saving, check for an equivalent rule and keep my other instructions. Show me the exact text and where it goes in each app, and wait for my yes. After saving, read it back. For any app you can't update, give me the text and where to paste it. Tell me which apps to test in a fresh session.
```

**5. Ask Claude Code to change model settings so simple work runs on a cheaper model.** Already in `report-template.html` (`#try-model`): it reads `~/.claude/settings.json` and the helper agent files, proposes Sonnet as the default with `/model opus` for hard work (or `opusplan`), `model: haiku` for helper agents that only read, leaves effort at its default, and waits for a yes.

## Surfaces to change

| Surface | Change |
|---|---|
| `SKILL.md` | A Briefs & setup fix is a rule or skill by default, with a one-time prompt only when neither fits. Pick the target app by session count. Every setup prompt asks the AI to show the change and wait for a yes, and stays under 1,800 characters. Define what a Decline means for follow-up. Add the "Approve" and "Decline" wording |
| `report-template.html` | Proposal block in place of the `Try this` block for cards 1–5, plus Approve and Decline scripts. Print shows the prompt open. Fix 3's "How much to check" table moves into the skill prompt |
| `references/design-system.md` | The proposal block and its approved, declined and copied-fallback states |
| `scripts/check_report.py` | Count proposal blocks as well as `Try this` blocks for the saving-line check. Check each prompt's length |
| `README.md`, `Faq.tsx`, `GLOSSARY.md` | Any wording on fixes as paste-in prompts, plus the new words |
| `public/sample-report-preview.png` | Only if the Overview changes. It shouldn't |
| Wonder | Preview card 3 first (AGENTS.md: one preview, then apply). Then cards 4 and 5, and the Needs you page |
| Release | Skill folder changes, so ask before cutting a release |

## Open questions

1. Should fix 3 be a skill (matches the pending Ship Checks preview) or a plain saved rule (simpler, one less thing to install)? Proposal: skill.
2. Should the 1,800-character cap hold for fix 1, whose four rules plus app scopes already run near 900 characters? It fits today.
3. Should a Decline be visible to the next review? It can't be without writing a file, and the report has no way to write one. Proposal: no for now.
