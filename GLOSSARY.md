# Second Look

Second Look reviews how a person works with AI apps and tracks their habits over time. These are the words its reports use.

## App

An AI product where you work, such as Codex, Claude Code or Cursor. A tool call is an action an assistant takes, such as reading a file. A helper agent handles a task in a separate session.

## Session

An exchange with an AI, from your first message until you start a new session. Use “session” consistently in reports, product copy and guidance. Source-format names such as `conversations.json` and `conversation_search` keep their original spelling.

## Project

A group of sessions associated with recorded project or workspace information. Verified local folders
in Claude Code, Codex and Cursor qualify without Git; worktrees use their main repository.
Matching names combine across apps unless the user separates them. Stable IDs preserve identity;
display labels may change. Full paths are not retained. **Unknown** means usable project information
was unavailable, including unresolved older history; it does not mean the session had no project.

## Usage

**Usage**:
How much of a person's AI allowance a session or request consumed, weighted so re-reading cached history counts for less than new input or output.
_Avoid_: Cost, spend, token cost, tokens

**Doing the work**:
Usage spent reading, thinking and writing for what the person asked.
_Avoid_: Productive usage, shipped, finished

**Re-reading long sessions**:
Usage spent re-reading a session's history once it passes the long-session line.
_Avoid_: Overhead, bloat, waste

**Long-session line**:
The session length past which re-reading counts separately. It is a chosen setting, not a measured limit on quality.
_Avoid_: Context limit, bloat threshold

**Starting context**:
Everything loaded before the person's first message in a session: the app's own instructions, the skill list, connectors and instruction files.
_Avoid_: Baseline, system prompt, overhead

**Typical session**:
The person's own median session in a review period. "High" and "low" in a report always mean against this or against their last review, never against other people.
_Avoid_: Average user, benchmark, norm

**Usage finding**:
A finding backed by usage evidence, placed inside the report part it belongs to. Usage has no section of its own. It shows only when there is a change the person can make, the next review can check it, and the thing involved accounts for at least a tenth of their usage.
_Avoid_: Token report, token effectiveness, usage section

**Long-session share**:
The share of a person's usage that came from sessions past the long-session line. The one usage number tracked over time.
_Avoid_: Bloat rate, overhead share

**Usage breakdown**:
The split of usage into doing the work, re-reading long sessions and redoing work. Shown for an app in a week its 5-hour limit filled up, over the windows that filled.
_Avoid_: Ledger, token ledger

**5-hour limit**:
How much an app lets a person use in a 5-hour window. Claude Code logs when it refuses a request, so a report says the person hit the limit. Codex logs how full the limit is, so a report says it reached 100%. Each window counts once.
_Avoid_: Quota, rate limit, session limit, blocked (for Codex)

**Redoing work**:
Usage on replies the person corrected in their next message.
_Avoid_: Rework, waste

## Events and patterns

**Correction**:
A request that opens by rejecting or redirecting the previous reply.
_Avoid_: Pushback, redo

**Restart**:
Starting the same topic over in a new session within 2 days. A restart is an event and is not counted as redoing work.
_Avoid_: Retry, abandoned session

**Repeat request**:
An opening request that matches 3 or more earlier ones and was still typed by hand: no skill ran and no schedule started it. A candidate for a skill, a hook or a scheduled task.
_Avoid_: Duplicate, restart

**Goal worth retrying**:
A measurable result that 3 or more sessions across at least 2 weeks worked toward in one project, with different requests each time. A review proposes a retry only after a newer model comes out in an app the person used for it.
_Avoid_: Retry, repeat request

**Unattended run**:
A session that a scheduled task, a loop or a headless run (`claude -p`, `codex exec`) started, with nobody typing the first message.
_Avoid_: Background session, bot run

**Habit**:
A pattern that recurs across review periods. Only habits get paired with a recommendation to try.
_Avoid_: Incident, behavior

**Recommendation**:
A change Second Look suggests for a habit: a saved rule, a skill, hook or schedule, a settings change, or a one-time prompt. Many habits aren't problems, so a recommendation often automates something that already works. The user can edit the prompt first. **Open in <app>** ("Open in Codex", "Open in Claude Code") opens the user's app with the recommendation's prompt typed in, including their edits; the app shows the change and waits for their yes. **Decline** sets the recommendation aside in that browser.
_Avoid_: Fix (for a habit; "fix" stays only for skills with wrong information, as in "Skills to fix"), problem (for a habit), automation (for every recommendation), auto-fix, apply

## Work categories

The six kinds of work, read from each session's opening message:

- **Coding** covers building, fixing and shipping software, including prototypes.
- **Design** covers interfaces, mockups, layouts, visuals and branding.
- **Writing** covers drafting and editing documents, decks, posts, emails and similar material.
- **Research** covers looking things up, comparing options and analyzing data.
- **Planning & ideas** covers brainstorming, plans, roadmaps and priorities.
- **Questions & advice** covers asking for advice or answers, and any session that fits none of the others.

_Avoid_: Prototyping, Writing & content, Brainstorming, Career, Consultation (the names before Nov 2026)
