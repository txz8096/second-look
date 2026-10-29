# second look pitch

One story in five lengths.

**The problem is leaks.** Some of your tokens go to the work. The rest leak out in three places:

| Where | What leaks |
|---|---|
| **Prompts** | Replies you had to correct, rules you retype in every tool |
| **Context** | Long sessions that drift between projects, memory that loads what you no longer need |
| **Setup** | Skills and plugins that are stale, conflicting, or duplicate what the model now does on its own, loading into every session |

**Drift is why they open.** Models change every few months, and your habits and setup drift out of step with them. You can't see that from inside one chat. And a leak you don't see costs you again every session after.

Every version ends on the same install line:

```
Install second look from github.com/txz8096/second-look.
```

## 1. Spoken one-liner

**Short (about 10 seconds):**
> second look reads your AI sessions and finds where your tokens leak: in your prompts, your context and your setup. Then it gives you a few fixes.

**Long (about 30 seconds), for when someone asks a follow-up:**
> Models change every few months, and the way you work drifts out of step with them. You retype the same rules. Sessions run long and wander between projects. Skills you wrote for an older model keep loading every time. You can't see any of it from inside one chat, so it keeps costing you. second look reads across all your sessions, shows where your tokens leak, and gives you a few fixes with the evidence behind each one. You install it by asking your assistant: "Install second look from github.com/txz8096/second-look."

## 2. Hero headline and subhead

**Headline (unchanged from the live site):**

- **Learn from how you work with AI.**

The headline stays broad. The subhead carries the leaks story.

**Subhead:**
> Models change, and the way you work drifts out of step. second look reads your sessions across Claude Code, Codex, Cursor, ChatGPT and more, finds the leaks in your prompts, context and skills, and gives you a few fixes to try. Each one cites the sessions it came from.

**Secondary line, for people who haven't customized anything:**
> Mostly in ChatGPT or claude.ai? Add your export and it reads those chats too.

## 3. README opener

> # second look
>
> **Learn from how you work with AI.**
>
> Models change every few months, and the way you work drifts out of step with them. Tokens leak in three places: your prompts (corrections, rules you retype in every tool), your context (long sessions, memory you no longer need) and your setup (skills written for an older model, still loading every session). You can't see any of it from inside one chat, and a leak you don't see costs you again every session after.
>
> second look is an open-source skill that reads your sessions across Claude Code, Codex, Cursor, Antigravity, claude.ai, ChatGPT and Gemini. It shows where your tokens go and gives you a few fixes to try, each with the sessions behind it. Run it again later and it checks whether the fix stuck.
>
> Paste this into Claude Code, Codex or Cursor:
>
> ```
> Install second look from github.com/txz8096/second-look.
> ```

## 4. Social post (X / LinkedIn)

> The tokenmaxxing era measured how many tokens we burned. I wanted to know how many went to the actual work.
>
> Models change every few months. The way we work drifts out of step, and tokens leak:
> → in your prompts: corrections, rules you retype in every tool
> → in your context: long sessions that wander between projects
> → in your setup: skills written for last year's model, still loading every session
>
> You can't see any of this from inside one chat. And every leak you don't see costs you again next session.
>
> So I built second look. It's an open-source skill that reads your sessions across Claude Code, Codex, Cursor, ChatGPT and more, and gives you a few fixes with the evidence behind each one. No server, no account.
>
> To try it, paste this into your assistant:
> Install second look from github.com/txz8096/second-look.

The X version fits in a thread: post 1 is the first two paragraphs, post 2 is the rest.

## 5. Video script (about 90 seconds)

Built for X and LinkedIn with muted autoplay, so every narration line has a caption. The demo uses the site's sample report, and the narration says so.

| Time | On screen | Narration (you) |
|---|---|---|
| 0:00–0:06 | Screen recording: typing a correction into a chat, e.g. "No, use the spacing tokens like I said." Cursor blinks. Caption: **Third time.** | "You've told your AI this before. Twice." |
| 0:06–0:16 | Quick cuts: Claude Code, Codex, Cursor, ChatGPT, a changelog, a "new model" announcement. | "New tools, new models, new best practices every few months. Nobody can keep up with all of it. And the way you work quietly drifts out of step." |
| 0:16–0:30 | Text cards, one per beat: **Tokenmaxxing** → **How many went to the work?** → **Where the rest leaks**: prompts · context · setup | "The tokenmaxxing era taught us to burn more tokens. The better question is how many go to the work. The rest leaks out. In your prompts. In your context. In your setup." |
| 0:30–0:40 | One chat window shrinks into a grid of dozens of sessions. | "You can't see a leak from inside one chat. And a leak you don't see costs you again every session after." |
| 0:40–0:50 | Claude Code: type "run my review". The skill starts reading sessions. | "So I built second look. It reads your sessions across Claude Code, Codex, Cursor, ChatGPT and more. No server, no account." |
| 0:50–1:15 | Sample report opens. Corner tag: **Sample data**. Scroll and zoom to one finding per leak: "You retype the same rules in every tool" → "Long sessions drift between projects and take most of your usage" → the skill check with its "Replace the old copy" fix. | "Here's a sample report. Rules retyped in every tool: a prompt leak. Long sessions drifting between projects, taking most of the usage: a context leak. A skill with outdated copy, loading into every session: a setup leak. Each finding cites the sessions it came from, and comes with one fix to try." |
| 1:15–1:22 | The trend chart in the report. | "Run it again next month and it checks whether the fix stuck." |
| 1:22–1:30 | End card, large type: `Install second look from github.com/txz8096/second-look.` | "To try it, paste this into your assistant." |

Before recording, check that the sample report on the site still shows these three findings and the trend chart. The 0:50 segment depends on them.
