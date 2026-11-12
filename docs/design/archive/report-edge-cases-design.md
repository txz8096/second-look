# Report edge cases: canvas handoff

> Historical design exploration. The 2026-11-11 implementation and shipment audit is in [Wonder design sync](wonder-design-sync-shipping-2026-11-11.md). It supersedes older “unshipped” statements for implemented filters, skill discovery and conditional states. Rich permission/parse diagnostics remain deferred by the selected scope.


Design exploration, 2026-11-08. This is a desktop specification with illustrative data, not a production implementation or launch approval. No personal session logs were inspected.

## What was designed

The launch pass identified 25 primary cases and five additional checks. The independent critique added the adequate-evidence/no-actionable-issue case. These 31 conditions are grouped into eight representative screens and four reusable inline states. A mapped condition is not an individually rendered fixture; the variants below share interaction patterns.

| Canvas design | Cases represented | Result and next step |
| --- | --- | --- |
| [Sparse Review Overview](https://app.wonder.so/melissa-tang/files/01a18e27-aa7e-75c0-b8aa-aa84e1463d5b/branches/main/pages/01a18e27-aa80-733d-a3df-27cf3c2a8f2c?nodeId=b9762742-a7a5-5651-a80b-f70a7539530b) | 2–3; sparse evidence | Preserve activity and individual examples. Explain each unavailable measure locally. Skills remain independently reviewable only if actually available. |
| [No Sessions Preflight](https://app.wonder.so/melissa-tang/files/01a18e27-aa7e-75c0-b8aa-aa84e1463d5b/branches/main/pages/01a18e27-aa80-733d-a3df-27cf3c2a8f2c?nodeId=3830ee11-701e-539b-a1e2-17298a871fd4) | 1, 7–9; selected period empty | Proposed preflight with explicit period and source outcomes. No completed report is claimed. Missing or inaccessible sources remain unknown. |
| [Report Coverage Manager](https://app.wonder.so/melissa-tang/files/01a18e27-aa7e-75c0-b8aa-aa84e1463d5b/branches/main/pages/01a18e27-aa80-733d-a3df-27cf3c2a8f2c?nodeId=a3509a1f-a67d-524d-aefe-7acc580721ca) | 6–9, 14–16, 25 | One row per app, source-specific action, latest included session dates, honest retention limits. |
| [Add History Instructions](https://app.wonder.so/melissa-tang/files/01a18e27-aa7e-75c0-b8aa-aa84e1463d5b/branches/main/pages/01a18e27-aa80-733d-a3df-27cf3c2a8f2c?nodeId=df74ed30-83f1-56e2-9ee8-2b86e76174c3) | 6, 8–9, 14; recoverable missing exports | Explain the assistant handoff, show a copyable request, generate another snapshot. |
| [Updated Report Snapshot](https://app.wonder.so/melissa-tang/files/01a18e27-aa7e-75c0-b8aa-aa84e1463d5b/branches/main/pages/01a18e27-aa80-733d-a3df-27cf3c2a8f2c?nodeId=c5360824-36ab-5af0-a2f9-bf4a53003225) | 13; overlapping-history check | Describe verified coverage changes without claiming improved habits or unsupported deduplication counts. Existing weekly overlap-replacement rules still apply. |
| [Reading Issues Review](https://app.wonder.so/melissa-tang/files/01a18e27-aa7e-75c0-b8aa-aa84e1463d5b/branches/main/pages/01a18e27-aa80-733d-a3df-27cf3c2a8f2c?nodeId=80c63561-3015-51c8-9975-5fc160005049) | 10–12 | Proposed verified read/parse diagnostics. Keep readable evidence, unknown failure volume, source-specific help and a visible copy request. |
| [Metric Availability Review](https://app.wonder.so/melissa-tang/files/01a18e27-aa7e-75c0-b8aa-aa84e1463d5b/branches/main/pages/01a18e27-aa80-733d-a3df-27cf3c2a8f2c?nodeId=22cf59c8-d945-599c-9675-5a8577912acb) | 17–18, 21, 24 | Distinguish missing fields, no qualifying work, and estimated session counts. More data cannot repair unsupported fields. |
| [Comparison Eligibility Review](https://app.wonder.so/melissa-tang/files/01a18e27-aa7e-75c0-b8aa-aa84e1463d5b/branches/main/pages/01a18e27-aa80-733d-a3df-27cf3c2a8f2c?nodeId=df15e06a-c904-5f53-8f68-abf8122909a7) | 3–5, 13, 16, 22–23 | Retain an eligible current value, withhold unsupported change, separate incomplete weeks, and explain comparable scope. |
| [Filtered Sessions Empty](https://app.wonder.so/melissa-tang/files/01a18e27-aa7e-75c0-b8aa-aa84e1463d5b/branches/main/pages/01a18e27-aa80-733d-a3df-27cf3c2a8f2c?nodeId=0f271f29-0304-5b1c-8f25-51d429e9701e) | 19–20 | Show applied filters and an explicit return to all included dates/apps/work types. |
| [No Saved Skills](https://app.wonder.so/melissa-tang/files/01a18e27-aa7e-75c0-b8aa-aa84e1463d5b/branches/main/pages/01a18e27-aa80-733d-a3df-27cf3c2a8f2c?nodeId=000e3783-4a41-584b-a376-47dce3e93988) | No saved skills | Verified absence only; explain a skill and preserve available session findings. Separate not-included/unreadable copy remains in the interaction spec. |
| [No Strong Findings](https://app.wonder.so/melissa-tang/files/01a18e27-aa7e-75c0-b8aa-aa84e1463d5b/branches/main/pages/01a18e27-aa80-733d-a3df-27cf3c2a8f2c?nodeId=9f38745d-ce53-5e41-baf1-7b634fd00f3a) | No strong findings | Omit weak recommendations while keeping supported evidence available. |
| [No Actionable Issues](https://app.wonder.so/melissa-tang/files/01a18e27-aa7e-75c0-b8aa-aa84e1463d5b/branches/main/pages/01a18e27-aa80-733d-a3df-27cf3c2a8f2c?nodeId=80808961-d81b-5ed6-9fd9-3ff979a34cc3) | Adequate evidence, no actionable issues | A neutral valid result with no request for more information. |

First-report-with-history is a cross-cutting rule: existing historical data may already support a comparison. Sample contamination is also cross-cutting: each full screen labels example data in its main content and sidebar. Supplementary states carry their own example label.

Start from [Report Edge Cases Caption](https://app.wonder.so/melissa-tang/files/01a18e27-aa7e-75c0-b8aa-aa84e1463d5b/branches/main/pages/01a18e27-aa80-733d-a3df-27cf3c2a8f2c?nodeId=fd437140-0f18-50ec-8273-71e1988e6f7e) on the same second look canvas page. Original landing/report designs were preserved.

## Recovery flow and behavior contracts

Report → data coverage → source-specific instructions → return to the assistant → generate a new report → open the updated snapshot.

The saved HTML does not upload files, scan newly created skills, retry collection, or update itself. “Copy instructions” copies the visible request and should announce “Instructions copied” when implemented. A newly generated snapshot must establish its own sources and dates.

“View all included sessions” resets all date, app and work-type filters, then shows the verified included total. Its illustrative total is 38. Do not retain a count or promise this reset if the implementation cannot establish it.

Navigation to skills, findings, previous reports and included evidence is conditional on a real destination. The sparse fixture assumes accessible skill files; the updated fixture assumes a previous report exists. Do not show these links otherwise.

A recovery link must lead to actionable source-specific instructions. The existing ChatGPT instructions screen is the full rendered example. Other source help, expanded details, clipboard feedback and destination states are specified but not interactive in the canvas exploration.

## Critique and revisions

Three independent roles contributed: launch scenarios, interaction design, and devil's advocate. The first critique revised umbrella zero-evidence wording, source-record terminology, latest-session dates, overlap claims, action placement and comparison eligibility.

The canvas review then produced these changes:

- The no-evidence result now names the selected review period; an absent source does not imply no activity elsewhere.
- All full-screen main headers now label illustrative data, so a main-content crop retains the distinction.
- Read failures now expose source-specific help and a visible request for the assistant. A readable-session example shows the limit of a retained observation.
- Coverage uses separate Cursor and Antigravity rows.
- Lists omit the final divider while retaining their enclosing border.
- Skills education says a future review can inspect newly saved files.
- Filter recovery explicitly returns to all included sessions.
- Adequate evidence with no actionable issue is separate from insufficient evidence.

See [scenario research](report-edge-cases-scenarios.md), [interaction specification](report-edge-cases-interaction.md) and [independent critique](report-edge-cases-critique.md) for detailed triggers, source references and open questions.

## Selected direction

Melissa selected all three choices in this review:

- No usable sessions produces a source check before a report, rather than a saved diagnostic report.
- The first implementation uses today's source statuses. Richer permission and parsing diagnostics remain future concepts and are excluded from that implementation scope.
- A fuller example opens as a separate sample report; it is never mixed with the user's sparse results.

The preflight and separate-example designs already reflect those choices. The Reading Issues Review artboard remains a future concept, not a first-implementation requirement. These choices are design direction only; production implementation has not been requested in this task.

## Implementation prerequisites and remaining checks

1. Zero-session output: the current validator rejects an empty session cube. The selected preflight must run before report generation; it must distinguish a verified zero result from an unperformed or failed check using only available evidence.
2. Rich diagnostics: permission/partial-parse categories require collector instrumentation and are deferred. Existing path/status values do not prove readable records, failed-session counts or complete coverage.
3. Fuller examples: preserve a separate sample report with explicit example-data labeling in reading, print and share outputs.
4. Metadata: qualifying counts, metric start dates, source/date changes and prior-report links must be verified before displaying them.
5. Aggregate-only history, cloud inability, quiet periods and usage-field gaps have scenario/spec coverage but no separate full-page fixture. Use the same source-local/metric-local patterns; validate them with real generated fixtures before release.

## Verification and scope

Reviewed screenshots after final edits for all eight full screens and four inline states, plus the group caption. The independent critic inspected three full screens by screenshot/JSX and three inline states by code/tree. This verifies desktop visual composition and copy, not runtime behavior, keyboard access, screen-reader announcements, responsive layouts, clipboard behavior or collector correctness.

No application code, product skill, report template, public sample, README, metadata, listings or release artifact was changed. Their behavior has not changed; richer proposed states remain explicitly unshipped. No build or runtime tests were run for this canvas/document-only exploration.

Changed repository folder: `/Users/zhouyou/Documents/GitHub/second-look/docs/design/`. Canvas additions are in the existing **second look** file.

## 2026-11-11 · Selected edge-case visualization update

Applied the approved minimal-color, pink-first rule to the 22 areas Melissa selected on the launched page of **second look sample report**. This is a canvas-only follow-up to the chart palette work; it does not implement the proposed edge-case behaviors or publish a new release.

Four existing screens required changes:

- [Updated Coverage Settings](https://app.wonder.so/melissa-tang/files/01a1a83e-7866-73b5-bbba-494e6ae1cb06/branches/main/pages/01a1bef0-8041-7008-9cc4-cb755cd1295f?nodeId=01a1cd17-012f-774d-8435-bf37afed1601)
- [Updated Unsupported Measures](https://app.wonder.so/melissa-tang/files/01a1a83e-7866-73b5-bbba-494e6ae1cb06/branches/main/pages/01a1bef0-8041-7008-9cc4-cb755cd1295f?nodeId=01a1cd17-0130-766e-8a00-6f47b0ab4b08)
- [Updated Comparison Not Ready](https://app.wonder.so/melissa-tang/files/01a1a83e-7866-73b5-bbba-494e6ae1cb06/branches/main/pages/01a1bef0-8041-7008-9cc4-cb755cd1295f?nodeId=01a1cd17-0131-7108-8c20-c0764bfb348a)
- [Updated Unreadable Sources](https://app.wonder.so/melissa-tang/files/01a1a83e-7866-73b5-bbba-494e6ae1cb06/branches/main/pages/01a1bef0-8041-7008-9cc4-cb755cd1295f?nodeId=01a1cd17-0132-762b-b705-d0cb96bc8207)

Updated 14 chart/legend marks from the pale brand pink (`--brand-pink`, #f2a7b8) to the existing chart pink (`--candidate-chart-pink`, #e6308a): five independently labeled work/app bars, five coverage data segments, two matching Data swatches, and the comparison line/endpoint. Brand, navigation and action colors remain unchanged. No extra hues, outlines, patterns or underlays were added.

The comparison-not-ready fixture had an unsupported “Up: more sessions opened with a brief” caption despite explicitly lacking a valid comparison. Replaced it with the existing measured result: “6 of the last 10 Codex sessions opened with a brief (60%).” Preserved the 60% endpoint, earlier-window limitation, source scope and incomplete-week explanation. Missing or unreadable data stays neutral and unknown; unsupported measures are not rendered as zero. The 18 other selected areas had no relevant color mismatch and were left untouched.

Verification: read all 22 selected subtrees before and after. Every subtree exactly matches its original plus the 14 color substitutions and one caption edit. Reviewed final screenshots of all four changed screens and finished them. Scenario captions, row arrangement, controls, labels, sample values, supported evidence and recovery instructions were preserved. This targeted review was performed by the canvas editor; it was not an independent broad scenario audit. No new scenarios, artboards, product behavior, runtime tests, build, commit, push or release were added for this pass. Changed repository folder: `/Users/zhouyou/Documents/GitHub/second-look/docs/design/`.

## 2026-11-11 — Import confirmation simplified (one preview, under review)

Melissa questioned the value of Coverage Change Group in Updated Report With New Export. Replaced only that group in the existing screen with a compact, non-interactive confirmation: “More ChatGPT history included” and “Latest included session: Nov 6. Previously: Oct 12.” Reused the dates already in this fixture, existing card/text/font tokens and full column width. Removed the generic comparison advice, earlier-report reminder, pencil header and chevrons that implied actions. Existing Explore links still provide access to findings, trends and coverage; the rest of the screen is preserved exactly. This reduces the interruption to a factual acknowledgement instead of asking users to interpret source-mix changes. No new metric, automatic comparison or runtime capability is claimed.

Read back the full screen: outside the selected group, JSX matches the before state exactly. Reviewed final full-screen screenshot for hierarchy, fit and preserved destinations. This is one design-only preview on the launched page; the edge-case flow remains under review, unimplemented and unshipped. No production files, commit or release changed.


## 2026-11-11 — Skills-check section is conditional

Melissa clarified that Skills Still Section must appear only when saved skills exist. The Updated No Sessions Check preview does not establish usable saved skills, so its skills-check section and action were removed. Its scenario caption now explicitly states no saved skill files are included and records the conditional visibility rule. The rest of the screen, including source statuses, recovery actions and navigation, is unchanged. Read-back comparison confirms only the selected subtree was removed; reviewed final screen and caption screenshots. Interaction specification records the available/none/not-included/unreadable distinction. This remains design-only and unshipped; no runtime behavior, commit, build or release changed.

## 2026-11-11 — Restore the normal Overview after adding history

This supersedes the compact import-confirmation proposal above. Melissa rejected the notice as duplicate information and asked to retain the summary and activity visualization. Updated only Updated Report With New Export in place: removed History Update Confirmation, restored the standard sample review summary, and duplicated the existing approved dark Overview “What you use AI for” chart into the same screen before Explore your report. Its category colors, legend, 13 weeks, 65 mark heights and coverage link are preserved; no “View chart data” link was added. The chart is in its resting state; the copied hover-preview overlay was removed. Sidebar, app bar and Explore content match the pre-edit screen exactly. No extra artboard was created.

The chart caption says “Illustrative data” and the scenario caption states that both summary and chart use the existing sample: actual regeneration must use the newly included export. No updated metrics or newly calculated findings were invented. This is a design-only preview of the retained Overview structure, not evidence of new import results. Reviewed the full screen and scenario-caption screenshots; no clipping was observed. Production implementation, build, tests, commit and deployment are outside this request.

## 2026-11-11 — Time filter dropdown (one desktop preview)

Melissa requested a dropdown for Time with 4 weeks, 3 months, 6 months, 12 months and a custom From/To range, preserving the other filters and fitting Clear filters on the row when possible. Updated the existing Habits No Matching Sessions Matched screen in place, with the time menu open for review. Time, existing App chips, existing Work select and Clear filters fit one desktop row without shrinking the existing controls. The session count is on the same filter row at the far right, with right-aligned text; only the coverage link sits below. App and Work subtree JSX is identical; full-screen comparison confirms every element outside the selected filter area is unchanged. No additional artboard was created.

Menu: four divided preset rows, check beside the currently selected 12 months, then a Custom range form with labeled From/To fields, calendar icons and Apply range. Dates are blank in this preview, so Apply range is shown disabled. File tokens and Lucide icons were reused. Screenshot review confirms the row fits and the open menu has no clipping; it overlays the report as a popover. This is design-only: runtime custom-date filtering is new proposed behavior and is not implemented, tested, committed or shipped. Other screens remain unchanged until approval.

Interaction contract for implementation: presets apply immediately and close the menu. Custom dates apply together after both are valid, with From no later than To; show a field error for an invalid order. Bound future dates by the saved report date. Custom filtering must preserve the chosen App and Work filters and distinguish no matching sessions from missing coverage. The trigger displays the applied range. Escape/outside click dismiss without applying draft dates and restore focus to Time. Clear filters restores the report's default time range and clears App/Work selections. On narrower widths allow controls to wrap rather than reducing text or hit areas. Acceptance checks should cover preset selection, same-day custom range, reversed/blank dates, an empty result, dismissal without applying and Clear filters after a custom selection.

## 2026-11-11 — Explore destinations match the standard Overview

Melissa identified that Updated Report With New Export still omitted Skills. The earlier import-focused mockup had substituted Data coverage, and the summary/chart restoration had preserved that drift. Corrected only Explore Section in place: Briefs & setup → Skills → Habits & usage, with the same existing sample descriptions and View fixes / Review skills / View trends actions as the standard Overview and report template. Reused the existing row and arrow artwork, restored the two surrounding descriptions and preserved row dividers/container border. Coverage remains accessible through the chart and Settings. The seven-skills/three-findings sample is reused from the standard fixture, not a newly calculated import result.

Read-back confirms all content outside Explore Section is unchanged. Reviewed final full-screen screenshot for order, copy, layout and dividers. This remains an unshipped canvas review; no production change, commit or release.

## 2026-11-11 — Explore existing skills before authoring

Updated only Skills Resources in No Saved Skills With Resources. The primary heading is now “Explore skills”, with two discovery/install resources: skills.sh and Anthropic skills. The secondary “Want to write your own?” group contains one guide, Skill authoring best practices. Removed the introductory engineering article and overlapping Claude Code creation guide. Reused the existing rows, external-link arrows, file tokens and bordered lists; kept a divider between discovery rows and none after either list’s final row. No other copy or screen was changed, as confirmed by exact before/after JSX outside the section. Reviewed the final screenshot for hierarchy, spacing, text fit and dividers.

Verified destinations on 2026-11-11:

| Label | Destination | Role |
| --- | --- | --- |
| skills.sh | https://www.skills.sh/ | Community directory with skill discovery and installation instructions; installation docs at https://www.skills.sh/docs |
| Anthropic skills | https://github.com/anthropics/skills | Publisher-maintained skills collection and README install instructions |
| Skill authoring best practices | https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices | One optional guide for writing and testing skills |

The linked destinations were opened and their purpose verified. This is a static canvas specification: URLs above are the implementation mapping; runtime anchor navigation has not been implemented or tested. No skills were installed and no production code, commit, release or deployment changed. This edit does not approve the entire no-skills candidate for shipment.


### 2026-11-11 — Session count alignment refinement

Melissa requested the count on the same line as the controls, aligned to the right. Moved the existing count to the end of the desktop filter row with an automatic left margin and right-aligned text. The coverage link remains below. Exact comparison excluding the moved count confirms every other node is unchanged; reviewed the full screenshot and confirmed the count fits without wrapping or overlapping controls. Existing Time-menu preview remains open. One existing artboard only; design-only and unshipped.

### 2026-11-11 — Platform-neutral skill benefit

Changed only the selected benefit’s two text nodes in No Saved Skills With Resources: “Works across Claude” / Claude-specific folder claim becomes “Reuse across AI apps” / “Use your skills in compatible AI apps. Setup and supported features vary by app.” This includes compatible platforms without claiming identical setup, features or universal folder portability. Existing styling and surrounding content are preserved; reviewed the final screenshot for fit. Canvas only, unshipped.

## 2026-11-11 — Approved filter structure applied across the page

Melissa approved the Time dropdown structure and requested all matching screens. Inventoried the pinned launched page: 18 filter areas across 16 Habits artboards plus Updated Comparison Not Ready and Updated Filtered Sessions Empty. Updated 17 additional areas in place; the approved Habits No Matching Sessions preview remains byte-identical. No artboards or unrelated pages were added or changed.

- Desktop: Time dropdown, original App choices, original Work control where present, Clear filters and a session count at the far right. The coverage link remains directly below. The comparison-limited fixture did not have Work, so none was invented.
- Phones: Time and right-aligned count share the first row. Existing App chips wrap within the available width with their original touch target sizes. Work and Clear filters share the following row; coverage follows. Time/Clear targets are 44px tall.
- Preserve each fixture’s selected range, app/work selection and count: 3 months / Codex / 14 sessions in the comparison case; 4 weeks / ChatGPT / Research / 0 in the empty case; 3 months / Prototyping / 247 in the filtered trend; existing 12-month/1,337 states elsewhere.
- Clear filters is visible but disabled in default all-app/all-work states; active filtered states retain the enabled control. The original empty-state Clear action was reused. Light and dark colors use their existing file tokens.
- Reused the approved Time control through duplication with selected-value/theme/mobile overrides, then placed the copies in existing filter groups. The approved preview retains the open preset/custom-date menu; other screens show its closed trigger. The same four presets and From/To Apply-range interaction contract applies to all copies; runtime custom-date filtering remains unimplemented.

Read-back audit: exactly one dropdown and one unchanged count per area, selected ranges preserved, no old time-segment controls remaining. Every element outside each filter area (allowing the coverage link’s requested relocation) matches the pre-edit JSX; App and Work subtrees match after whitespace/class-order normalization, except the deliberate phone width/flex adjustment enabling wrapping. The approved preview is unchanged after temporary duplication/placement. Reviewed each changed filter crop and representative complete screens, including both phone themes, active filters and edge cases. Captured a final full-artboard screenshot for every changed design and completed all 17 with screenshot-after-last-write verification. These are canvas designs only: no product template, generation guidance, landing asset, commit, release or deployment changed.
