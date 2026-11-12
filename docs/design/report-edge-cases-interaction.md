# Report edge cases: interaction specification

> Historical design exploration. The 2026-11-11 implementation and shipment audit is in [Wonder design sync](wonder-design-sync-shipping-2026-11-11.md). It supersedes older “unshipped” statements for implemented filters, skill discovery and conditional states. Rich permission/parse diagnostics remain deferred by the selected scope.


Design exploration only. This document proposes eight representative report states and reusable patterns; it does not authorize production behavior changes. Product capabilities remain defined by `plugins/second-look/skills/second-look/SKILL.md`, its scripts, and the report template. Fixtures used on canvas must be marked as illustrative.

Selected after review: a source check before report generation for no usable sessions; today's source statuses for the first implementation; a separate sample report for fuller examples. Rich permission/parsing diagnostics in state 5 are deferred concepts. The final canvas handoff and revision details are in `report-edge-cases-design.md`.

## Direction and shared structure

Preserve the current 64px app bar, 256px sidebar, Overview, Briefs & setup, Skills, Habits & usage, and Settings. Use the existing 32px page title, 20px summary, 14px body, 8px button radius, 14px card radius, neutral background/surfaces, and pink accent. Keep text within its existing page column without adding character-based width caps.

Use one primary action per view. Pink identifies the main action or selected control; issue explanations also require a visible text label and icon. Expandable rows have dividers between rows, with none after the final row. Keep the enclosing border of a bordered list.

The recovery flow is:

**Report → Review coverage → Useful source-specific instructions → Run another review in the assistant → Open updated report.** Returning to the existing report without adding information is also a complete outcome.

The HTML report remains a snapshot. It cannot claim an upload/import succeeded, refresh its data automatically, or verify a later assistant action. A newly generated report describes verified source/date changes; record-level added/skipped counts remain unsupported in this exploration.

Every report exposes a compact scope line:

> **Data included:** [count] sessions · [sources] · [date range]  
> Created [timestamp] · [source cutoff, when material]

This describes included information, not all of the user's AI activity. Source counts, failed/skipped counts, coverage dates, and eligibility metadata appear only when the collector verifies them. If unknown, say so. Never infer an expected total or percentage coverage from the supplied sources.

| Source state | Meaning |
| --- | --- |
| Included | Usable records were read and verified. A path-exists or `logs` status alone does not establish this. |
| No sessions found | A successful check found none within the stated scope. |
| Not included | This review did not receive or inspect the source. |
| Couldn't read | Permission or parsing prevented inspection. |
| Not available for this metric | This source cannot supply the required field. |
| Estimated | The displayed value uses the documented estimation method. |

Do not merge these into a generic missing-data badge. Unavailable values are never `0`, blank charts, blurred personal results, or fake example charts. Eligibility is measure-specific: five qualifying sessions applies to many rates, not every metric. A change measure needs ten qualifying sessions in each four-week window and eight weeks of comparable history where specified by the product.

## 1. Overview: small usable sample

**Cases:** 2, 3. Additional: no strong findings.

Order: scope line, title, summary, available findings, then concise explanations for unavailable measures.

> **Your report covers a small sample**  
> These sessions can show specific examples. Some rates and comparisons need more qualifying data.

Illustrative unavailable measure:

> **Brief completeness**  
> Not calculated · 3 qualifying sessions included  
> This rate needs at least 5 qualifying sessions.

Primary: **Review coverage**. Secondary: **Continue with this report**.

With five to nine qualifying sessions, eligible rates remain available. Comparison ineligibility must not label the whole report insufficient. Only show precise qualifying-session counts when source metadata supports that distinction.

When evidence does not support a strong recommendation:

> **No changes to suggest from this sample**  
> The included sessions did not provide strong enough evidence for a recommendation.

Keep useful, supported observations below. Do not generate filler advice. More existing information can support a rate or reveal another pattern; it does not guarantee findings or a better result.

## 2. Proposed preflight: no session evidence available

**Cases:** 1, 7, 8, 9. Also 22 when the selected period is empty but older data exists.

> **No session evidence was available for this review**  
> Review the source information below to see what was checked and what remains unknown.

Primary, when useful: **Review sources**. Secondary: **View an example report**. Treat this as a proposed preflight result before a findings report is generated; an optional example opens separately and retains its example-data label.

Use a reason appropriate to verified metadata. Reserve **No sessions were found** for a successful check of the stated source and period:

- Successful local search: **No [app] logs were found on this computer.**
- Cloud limitation: **This assistant cannot read the desktop logs on your computer.**
- Search unavailable: **Chat search was unavailable, and no export was included.**
- Quiet recent period: **No sessions were found for this period. Older included sessions are still available.**

For a missing source or inaccessible environment, say that source was not included or could not be checked; do not imply successful inspection. Offer **View included history** when older sessions exist. Quiet weeks are not evidence of deterioration.

Keep navigation available. Show source status and section explanations rather than empty metric-card grids.

**Skills-check visibility:** Show “Your skills can still be checked” and its “Check skills” action only when at least one saved skill file is available to review. Omit the entire section and action when no skills are found or none are included. Unreadable skill files need access-recovery copy rather than an actionable check promise. Session absence alone does not decide skill availability.

**Proposed capability:** the current checker rejects an empty cube. This preflight and a saved coverage-only artifact are distinct output choices; neither is silently implied by a polished report shell. If reading failed, use **This review couldn't read the source** and state that session availability is unknown. A missing path does not establish absence of activity elsewhere.

## 3. Settings: report coverage manager

**Cases:** 6–9, 14–16, 25. Supports 10–12.

> **Report coverage**  
> This report uses the sources below. Sources that were not included may change what it can show.

One expandable row per source. Columns: Source, Included, Latest included session, Status. A latest-session date does not imply continuous coverage. When a different date is known, label its provenance explicitly rather than putting it in this column. Example statuses: **Included**, **Latest included session predates this period**, **Not included**, **Original logs unavailable**. Use `—` for unavailable counts, with the reason in the row details. Existing `logs` or path-exists statuses do not prove readable records or their date range; that instrumentation gap remains explicit.

Expanded rows explain what was checked/provided, its verified dates, what is unavailable, and a source-specific recovery action when one exists.

> **Latest included session: [date]**  
> This report includes no sessions from this source after that date. If you have a newer export containing work you want reviewed, include it in your next review.

> **Earlier session logs are unavailable**  
> Saved weekly totals can support the measures they contain. They cannot restore session examples or details.

Combined problems use one Overview summary:

> **Coverage is limited in three ways**  
> A small recent sample, an older export, and unavailable earlier logs affect different parts of this report.

Expand those reasons in the coverage manager; avoid three competing banners.

Put recovery on the affected source row, for example **Show ChatGPT export steps**. Promote that action to the page primary only when it resolves a real, useful gap. Unused apps, unsupported fields, deleted logs, and sufficient coverage do not require an import. **Back to report** is a valid endpoint. Deleted raw logs receive an honest limit; an optional future-retention action cannot promise recovery of those logs.

## 4. Add existing data: assistant handoff

**Cases:** 6, 8, 9, 14. Recovery for 10–12 where possible.

> **Include [source] in a new review**  
> This report is a saved snapshot. Add the source in your assistant, then run another review to create an updated report.

Enter this flow from an affected source with a useful recovery method. The selected source is explicit; offer other supported methods only as secondary choices. Show source-specific instructions:

1. **Get an export** — Follow the linked instructions for [source].
2. **Return to your assistant** — Attach the export or make the local logs available there.
3. **Run another review** — Ask the assistant to include the added source and create an updated report.

Copyable prompt:

> Create an updated Second Look report using this export and the sources available for this review. Tell me which sources and dates you included, and which you could not read.

Primary: **Copy instructions**. Clipboard feedback: **Instructions copied**. Secondary: **Keep reading this report**.

> Add existing information when it is useful. You do not need to use AI more to complete this report.

No web upload drop zone, import-success animation, background refresh, or automatic return expectation.

## 5. Overview: source records could not be read

**Cases:** 10–12.

When usable records remain:

> **Some source records could not be read**  
> This report includes readable information from [source]. [Verified record count, if available] source records could not be parsed because [verified reason].

Keep usable findings visible. Qualify affected metrics beside those metrics. Primary: **Review reading issues**.

Expanded issue rows:

- **Permission denied** — The assistant could not open [source location]. Check access in the assistant, then run another review.
- **Some JSONL records unreadable** — [verified count, if available] source records could not be parsed. The remaining readable records are included. A malformed record may be one event inside an otherwise readable session; it does not establish a lost-session count.
- **Unsupported or invalid export** — This file could not be read as a supported [source] export. Get a fresh export using the linked instructions.

When counts are unknown, use **Some records could not be read** and **The unreadable record count is unknown**. Do not mix source records and normalized sessions in a single count or calculate a success percentage without a verified denominator.

When everything failed:

> **This review couldn't read the source**  
> Session availability is unknown. Resolve the issue below before the assistant can create findings.

**Proposed capability:** diagnostic categories and counts require collector work. Do not imply the current scripts expose them.

## 6. Habits & usage: metric-specific gaps

**Cases:** 17–21, 24. Additional: no saved skills.

Retain available measurements. Replace only unavailable measures with their actual reason:

> **Token usage unavailable**  
> The included [source] records do not contain token usage. More records with the same fields will not restore this measure.

> **No build opportunities in this sample**  
> These sessions did not include work where a build check applied.

> **Estimated Gemini sessions**  
> This count is estimated using [documented method]. It may differ from the number of conversations you remember.

Filter empty state:

> **No included sessions match these filters**  
> [count] sessions are available outside this selection.

Primary: **Clear filters**. Secondary: **Review coverage**. Show the outside-selection count only if known.

Work-filter explanation:

> **[count] sessions are outside this selection**  
> Review their classifications if this does not match the work you expected to see.

Do not silently reclassify work.

Skills must distinguish three states:

- **Verified absence**, using the source SKILL.md copy: **You haven't saved any skills yet. A skill is a saved set of steps the AI follows the same way each time.**
- **Not included:** **No saved skills were included in this review. Include existing skill files in a future review to check them for stale facts and missed updates.**
- **Unreadable:** **This review couldn't read the saved skills. Check access in your assistant, then run another review.**

Use verified absence only after a successful check of the applicable scope. A missing export or unreadable directory is not proof that the user has no skills. Preserve session findings in all three states. Instruction action where applicable: **See how to include skills**.

## 7. Habits & usage: unavailable or misleading comparison

**Cases:** 4, 5, 13, 16, 22, 23. Also 3 for an ineligible comparison with eligible current rates.

Keep current-period facts. Explain eligibility on the comparison itself:

> **Change over time unavailable**  
> This measure needs at least 10 qualifying sessions in each four-week window and eight weeks of comparable history. The earlier window contains [count].

> **More comparable history is needed for [measure]**  
> This measure has qualifying data from [verified measure start]. It needs eight weeks of comparable history and at least 10 qualifying sessions in each four-week window. [State the verified unmet requirement.]

Do not calculate eligibility from the overall report date span or the elapsed time between its oldest and newest records. Use the measure's actual start, qualifying denominator, comparable source scope, and eligible windows. Do not render the start date or qualifying counts unless they are measured.

> **Source coverage changed between periods**  
> [New source] appears only in the recent period. Comparing these totals would mix a coverage change with a change in activity.

A same-source alternative is offered only if the pipeline supports it and that sample remains eligible. Otherwise keep the explanation without a graph.

> **This week through [latest included date]**  
> This partial week's totals are shown separately and excluded from completed-week comparisons.

Keep this activity visible even when it is the user's only recorded work. A cutoff date is not proof that later activity did not occur.

> **Earlier weeks use saved totals**  
> These totals support [named measures]. Session examples from those weeks are unavailable.

A first review can have a valid baseline when it contains sufficient comparable historical data. Do not require a previous Second Look report. Verify the rule per measure; retained aggregate totals do not automatically make session-level comparisons eligible.

## 8. Updated report: changed coverage

**Cases:** recovery from 6, 10–14, 25. Additional: overlapping reimport, valid first-review baseline, sample contamination.

This is a separate newly generated artifact with a new creation time. Lead with verified source/date changes:

> **Updated report created**  
> This report includes [source] with a latest included session on [verified date].

Do not show added-session or skipped-record counts as a default. Existing history rules replace overlapping week/app totals instead of appending duplicates; they do not establish record-level deduplication or added/skipped-record counts. Explain replacement at that scope when useful. Future record-level counts require stable identity and verified pipeline metadata before entering the UI.

> **Coverage changed**  
> This report includes [new range/source]. Some results may differ because the included data changed.

Action: **View coverage**. Offer **Open previous report** only when a real artifact link exists. Do not call changed results improved habits when added coverage explains the difference.

Sample reports retain a persistent **Example report · Illustrative data** label. Example records stay separate from personal imports and totals.

## Coverage audit

| Cases | Primary state |
| --- | --- |
| 1 zero sessions | 2 |
| 2 one to four qualifying sessions | 1 |
| 3 five to nine qualifying recent sessions | 1, 7 |
| 4 enough recent, fewer than ten prior | 7 |
| 5 less than eight weeks despite high volume | 7 |
| 6 absent ChatGPT/claude.ai/Gemini export | 3, 4 |
| 7 local app not found | 2, 3 |
| 8 cloud cannot read desktop logs | 2, 3, 4 |
| 9 chat search disabled and no export | 2, 3, 4 |
| 10 permission failure | 5 |
| 11 partial JSONL parse | 5 |
| 12 invalid export | 5 |
| 13 new app changes source mix | 7, 8 |
| 14 export ends before period | 3, 4 |
| 15 retention deleted older logs | 3 |
| 16 saved weekly totals without raw logs | 3, 7 |
| 17 app unsupported for a usage/tool measure | 6 |
| 18 sessions lack usage fields | 6 |
| 19 filters match zero | 6 |
| 20 Work filter excludes expected work | 6 |
| 21 no code changes/build opportunities | 6 |
| 22 quiet recent weeks | 2, 7 |
| 23 only current incomplete week | 7 |
| 24 estimated Gemini sessions | 6 |
| 25 sparse + old export + deleted history | 3, with affected patterns from 1 and 7 |
| First review with ample historical data | 7, 8 |
| No saved skills | 6 |
| No strong findings | 1 |
| Overlapping reimport | 8 |
| Sample contamination | 8 |

## Iteration 1 revision log

| Devil's advocate revision | Change in this specification |
| --- | --- |
| 1. Unperformed checks must not headline absence | State 2 now uses **No session evidence was available for this review** and is a proposed preflight. Verified empty checks retain scoped no-sessions wording. |
| 2. Source records are not lost sessions | State 5 headlines source records, removes assumed session-loss counts, and explains JSONL event/session ambiguity. |
| 3. `Through` implies continuous coverage | State 3 uses **Latest included session**, names date provenance, and explicitly withholds readable-data claims from path-exists/`logs` metadata. |
| 4. Overlap does not establish record deduplication | State 8 leads with source/date changes and describes same-week/app replacement. Added/skipped-record counts are withheld from the default design. |
| 5. Global import may not help | Recovery sits on the relevant source and is promoted only for a useful, recoverable gap. State 4 names its source. **Back to report** remains a complete outcome. |
| 6. Overall elapsed history does not qualify every comparison | State 7 ties start time, denominator, windows, and source scope to the actual measure. Partial-period activity remains visible and separately labeled. |

## Unresolved user choices

These are product choices for the user, distinct from ordinary interaction details:

1. Should no usable evidence produce a preflight result or a saved coverage-only report? Current exploration assumes preflight; a saved artifact requires an explicit validator/output-contract change.
2. Should the first implementation add measured read/parse diagnostics or stay within current source statuses? Keep richer diagnoses visibly proposed until collection supports them.
3. Should the optional example open as a separate report or a distinct labeled example view? Current exploration assumes a separate report so reading, printing, and sharing cannot mix simulated and real results.

## Implementation prerequisites

1. Define which source outcomes, parse failures, dates, and counts collectors can verify. Keep unknown outcomes explicitly unknown.
2. Connect each measure to its actual eligibility rule. Five sessions is not a universal report threshold; elapsed report range is not comparable measure history.
3. Define when changed source coverage suppresses comparison and whether same-source alternatives are supported.
4. Preserve existing week/app replacement semantics. Future record-level counts need stable identity and measured metadata.
5. Specify classification corrections through the assistant. A static report can explain a handoff but cannot silently repair source classifications.

No source code, report template, or product instructions were changed for this exploration.


### Updated report after additional history (2026-11-11 clarification)

Regenerating after an export retains the normal Overview: a review summary and the activity chart when supported by included evidence, followed by the applicable report destinations. Do not replace the useful summary or visualization with import guidance. Omit the duplicate history-update confirmation card. Recompute the actual summary, date window and chart from included data; a change in source coverage alone does not establish a change in habits. The current canvas reuses explicitly illustrative sample content to show this structure.


**Overview destinations after an import:** Keep the standard Briefs & setup, Skills and Habits & usage destinations in that order; an export update does not substitute Data coverage for Skills. Use actual review findings for their summaries. Coverage remains in the chart link and Settings. The separate no-session skills-check prompt still requires available saved skill files.
