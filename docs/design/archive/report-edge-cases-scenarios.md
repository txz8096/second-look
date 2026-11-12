# Report edge cases: launch scenario handoff

> Historical design exploration. The 2026-11-11 implementation and shipment audit is in [Wonder design sync](wonder-design-sync-shipping-2026-11-11.md). It supersedes older “unshipped” statements for implemented filters, skill discovery and conditional states. Rich permission/parse diagnostics remain deferred by the selected scope.


Design exploration, 2026-11-08. No production behavior changes are implied by these proposals. Scenarios use simulated data; no personal session logs were inspected.

## Existing product constraints

- Distinguish no activity, unavailable history, unsupported measurement and filtered-out data. `SCOPE` currently supports `logs`, `export`, `missing`, `not_found` and `not_readable`.
- Rates generally need 5 qualifying sessions in a 4-week window. Usage and message denominators have exceptions. Changes need 10 qualifying sessions in each 4-week window and 8 weeks since the measure began; Sessions per week counts itself and has no sample floor. The qualifying denominator is metric-specific, not always the total session count.
- First review does not mean no history: earlier app logs can provide a baseline. Remove the previous-fix follow-up when there is no earlier review.
- Gaps must never become zero values or favorable habit scores. Weak findings should be omitted.
- A report is a snapshot. Adding an export does not update the already-generated report.
- A zero-session chart state exists in the template, but `check_report.py:115` rejects a report without any session rows in its year window. A complete zero-data report is therefore a proposed variation, not verified supported output.
- Permission failures and partial parsing have no explicit `SCOPE` states. Proposed diagnostic designs require instrumentation; do not imply those diagnostics exist today.
- Export `to` currently derives from the latest parsed session or file modification time, not a guaranteed export-generation timestamp. Avoid claiming it is an exact export freshness timestamp.

## Sources

All paths below are under `plugins/second-look/skills/second-look/`:

- **K:** `SKILL.md`.
- **T:** `report-template.html`.
- **C:** `scripts/collect.py`.
- **V:** `scripts/check_report.py`.

“Existing” below means a code path or skill instruction was found. These states were not browser-tested in this research pass. All recommended interaction changes are proposals.

## Initial design families

| Family | Primary cases | Reusable design purpose |
|---|---|---|
| Coverage empty | 1, 7, 8, 9 | Explain what can be reviewed and why no session evidence is available. Keep environmental absence distinct from unused apps. |
| Sparse | 2, 3, 4, 5, 22, 23 | Preserve current activity and supported observations; withhold unsupported rates/comparisons. |
| Limited metric | 17, 18, 21, 24 | Explain metric-specific limits without calling the entire report incomplete. |
| Filter empty | 19, 20 | Explain the selected view and provide a direct way back. |
| Coverage repair | 6, 14, 15, 16, 25 | Explain source/date gaps and rank useful recovery actions. |
| Export instructions | 6, 8, 9, 14 | Source-specific steps with honest statements of what an export can add. |
| Import transition | 13 plus history-overlap case | Preserve snapshot semantics and avoid interpreting changed source mix as changed behavior. |
| Diagnostics | 10, 11, 12 | Proposed read/parse failure states; require new measured diagnostics. |

Cases may share families. The goal is reusable states, not 25 unrelated report layouts.

## Prioritized scenario matrix

| Priority / case | Trigger and what is known | Existing behavior / source | Proposed recovery or education |
|---|---|---|---|
| P0 / 1. Zero sessions | First review with no session evidence anywhere. No basis for habit judgments. | T:1362 can say “No data”; V:115 rejects no-session report output. **Full report state proposed.** | Honest report shell with found sources and one appropriate recovery action. Explain future sections without sample findings. |
| P0 / 2. 1–4 qualifying sessions | Some activity exists; rates may be unstable. | K:694; T:1493–1505 suppress qualifying rates below 5. Counts and exceptions remain possible. | Show supported activity/examples. Explain the particular measure’s requirement, not a universal floor. |
| P0 / 3. 5–9 recent qualifying sessions | Current rate may exist; change misses the comparison floor. | K:406–407, 694–696; T:1575–1579. | Current value without change; “Too few recent sessions to compare.” |
| P0 / 4. Earlier window sparse | Enough current sessions, too few in the 4 weeks before. | T:1368, 1579 names the earlier-window shortage. | Preserve current result. Offer older existing history if available; do not ask users to create more AI activity. |
| P0 / 5. Busy but new | Plenty of sessions, less than 8 weeks since measure began. | K:695–696; T:1366, 1573. | Explain sufficient recent activity versus missing temporal baseline, with actual dates. |
| P0 / 6. Export missing | User uses a web app but has not added its export. Missing data is not inactivity. | K:635–643; T:1189–1197, 1229–1231. | Source-specific add-export steps; explain what earlier sessions may add. Do not promise usage/tool-call measures. |
| P0 / 7. Local app not found | App path absent on this machine; use elsewhere remains unknown. | C:729–743 checks path presence; T:1200 says nothing to do if unused. | Optional explanation with unused-app and other-computer paths. Avoid treating every absent app as setup failure. |
| P0 / 8. Cloud review cannot read desktop | claude.ai run cannot access local app logs. | K:35–36, 640–643; T:1201, 1233 uses `not_readable`. | Run-on-computer instructions; retain usable cloud evidence and disclose scope early. |
| P0 / 9. Search off, no export | No cloud habit evidence; skill information may still be available. | K:38–42 requires every habit number “Not measured” and summary disclosure. | Separate accessible skills from missing habits. Offer chat-search or export paths. |
| P0 / 10. Permission/read failure | Folder exists, but reading fails; absence of parsed sessions is not known inactivity. | C:111–120 returns on JSONL OSError; C:740 can mark path `logs`. **Diagnostic state missing.** | Proposed “Couldn’t read [source]” with retry/location help. Instrument failure before exposing status. |
| P0 / 11. Partial parse | Some records parsed and others unreadable; omitted volume unknown. | C:111–119 skips malformed lines; no partial SCOPE state. **Diagnostic state missing.** | Proposed partial status. Show processed/skipped counts only if measured; qualify affected findings and offer retry. |
| P0 / 12. Export parse failure | File exists but usable history is unknown. | C:367–420 returns empty aggregate after stderr error; C:747–750 may still mark `export` with mtime fallback. **Diagnostic state missing.** | Proposed import-failed status and correct-format steps. Do not present successful “Through [date]” coverage. |
| P0 / 13. App mix changed | New source in one comparison window can explain apparent change. | K:501–503 requires shared-app comparison or omission. Automatic exclusion not verified in this read. | Identify sources in each window and offer shared-app comparison. Do not assign behavior credit/blame to adoption. |
| P1 / 14. Stale export | Export ends before review; later usage unknown. | K:178–181, 299 calls for refresh after 90 days; T:1191 Replace export. C:749–750 date is latest session or mtime. | Prefer “Latest session in this export” when that is all known. Refresh without discarding usable history. |
| P1 / 15. Deleted older logs | Claude Code retention boundary means earlier history unavailable. | C:725–743 infers cut; T:1170–1173, 1706–1713; K:654–657 says deleted weeks stay gone. | Say older logs cannot be recovered; offer longer future retention and distinguish saved totals. |
| P1 / 16. Aggregate history only | Saved weekly totals remain but raw logs may be gone. | K:298–299 preserves old weeks; K:638–640 adjusts cut to saved history. | Preserve trend, label aggregate-only evidence where relevant, avoid unavailable raw-session links/quotes. |
| P1 / 17. Unsupported app metrics | Substantial sessions exist, but selected apps do not expose usage/tool calls. | K:268–285, 314; T:1584–1597 restricts these measures to Claude Code/Codex. | Explain measure unavailable from that app. Do not suggest another export fixes it or pressure app switching. |
| P1 / 18. Usage fields absent | Claude Code/Codex sessions exist without saved usage counts. | T:1174–1176, 1613, 1711. | Distinguish included sessions from unavailable usage and show actual usage start date. |
| P1 / 19. Filters match nothing | Report contains data; current source/work/time selection excludes it. | T:1362, 1610, 1780–1783: no matches plus Clear filters. | Visible filter state and one reset action; avoid report-wide absence language. |
| P1 / 20. Work excludes denominator | Activity exists, but chosen work type excludes metric-qualifying sessions. | T:1611–1613; T:1762–1777 explains hidden groups. | Name qualifying work locally; show-all-work action can preserve other filters. |
| P1 / 21. No build/code work | No opportunity to measure testing or shipping. | T:1612–1613 distinguishes no build/research and no code changes. | “No code changes to assess in this view.” Never use 0% tested. |
| P1 / 22. Quiet recent weeks | Established history followed by inactivity; cause unknown. | T:1490–1510 counts quiet weeks after data began for counts, not earlier weeks. Rate gates remain. | Show activity faithfully; avoid productivity judgments and distinguish quiet periods from stale sources. |
| P1 / 23. Only incomplete current week | User’s only activity is real but not a complete weekly period. | V:119–122 prevents a partial week reading as quiet full week when earlier history exists; acknowledges new users may have only this week. | Explicit partial dates; no partial/full-week comparison and no silent loss of the only activity. |
| P1 / 24. Estimated Gemini sessions | No conversation IDs; prompts within 30 minutes grouped. | C:409–442; K:299–301 requires session measures called estimates. | “Estimated sessions” beside affected measures, not only methodology. More exports do not create exact IDs. |
| P1 / 25. Multiple issues | Sparse recent logs, stale ChatGPT export and deleted older logs coexist. | T:1218–1233 concatenates source flags; T:1762–1777 groups hidden reasons. No priority model found. | One dominant coverage summary with expandable source details and one highest-value action; avoid banner stacks. |

## Additional cases

- **First report with existing history:** K:650–652 allows baseline comparison from existing logs. Remove previous-fix follow-up, not existing trends.
- **No saved skills:** K:644–648 specifies one educational sentence, removes skill tables and their plan links. Do not retain sample skill counts.
- **No strong findings:** K:318 drops weak evidence; K:251 permits “Nothing relevant.” Do not invent fixes to fill cards.
- **Imported history overlap:** K:455–457 and V:103–107 require replacing the same week/app history, not appending duplicate totals. Re-import must not appear as increased activity.
- **Sample contamination:** V:51–58 detects leftover sample fixtures. Clearly label simulated designs; never mix genuine sparse data with sample charts.

## Questions for the devil’s advocate review

1. Does the action resolve the actual missing capability, or just encourage data collection?
2. Can a reader distinguish trustworthy zero from unknown without opening a tooltip?
3. Are 5 and 10 tied to the metric’s qualifying denominator?
4. Are valid partial findings retained while only unsupported claims are withheld?
5. Does adding history explain what may improve without promising trends, usage data or deleted logs?
6. Is low AI usage neutral rather than something the user must fix?
7. With three issues, can the reader identify one useful next action?

Research changed no source files. This handoff lives in `docs/design/`.
