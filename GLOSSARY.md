# second look

second look reviews how a person works with AI tools and tracks their habits over time. These are the words its reports use.

## Usage

**Usage**:
How much of a person's AI allowance a session or request consumed, weighted so re-reading cached history counts for less than new input or output.
_Avoid_: Cost, spend, token cost, tokens

**Request**:
One message the person sent to the assistant.
_Avoid_: Prompt (in reports), turn

**Doing the work**:
Usage spent reading, thinking and writing for what the person asked.
_Avoid_: Productive usage, shipped, finished

**Re-reading long conversations**:
Usage spent re-reading conversation history once a session passes the long-conversation line.
_Avoid_: Overhead, bloat, waste

**Long-conversation line**:
The conversation length past which re-reading counts separately. It is a chosen setting, not a measured limit on quality.
_Avoid_: Context limit, bloat threshold

**Starting context**:
Everything loaded before the person's first message in a session: the tool's own instructions, the skill list, connectors and instruction files.
_Avoid_: Baseline, system prompt, overhead

**Typical session**:
The person's own median session in a review period. "High" and "low" in a report always mean against this or against their last review, never against other people.
_Avoid_: Average user, benchmark, norm

**Usage finding**:
A finding backed by usage evidence, placed inside the report part it belongs to. Usage has no section of its own. It shows only when there is a change the person can make, the next review can check it, and the thing involved accounts for at least a tenth of their usage.
_Avoid_: Token report, token effectiveness, usage section

**Long-session share**:
The share of a person's usage that came from sessions past the long-conversation line. The one usage number tracked in the glance and over time.
_Avoid_: Bloat rate, overhead share

**Usage breakdown**:
The split of all usage into doing the work, re-reading long conversations and redoing work. Shown only when usage limits are a real constraint for the person.
_Avoid_: Ledger, token ledger

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

**Incident**:
Something notable that happened within one review period, such as a few very long sessions. Reports list incidents without a fix.
_Avoid_: Habit, pattern

**Habit**:
A pattern that recurs across review periods. Only habits get paired with a fix to try.
_Avoid_: Incident, behavior
