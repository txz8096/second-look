# Report edge cases: devil’s advocate review

> Historical design exploration. The 2026-11-11 implementation and shipment audit is in [Wonder design sync](wonder-design-sync-shipping-2026-11-11.md). It supersedes older “unshipped” statements for implemented filters, skill discovery and conditional states. Rich permission/parse diagnostics remain deferred by the selected scope.


Design review, 2026-11-08. Based on `report-edge-cases-scenarios.md`, the interaction handoff, and three representative canvas screens. These are design proposals, not claims that new diagnostics or report states already exist. No personal session logs were read.

Final direction selected by Melissa: source check before report generation; today's source statuses for the first implementation; separate sample report. The primary agent recorded final screenshot checks and applied revisions in `report-edge-cases-design.md`. Rich diagnostics remain deferred. This does not constitute independent runtime verification of the revised concepts.

## Eight design risks to resolve

| Risk | Concrete harm | Required revision / review test |
|---|---|---|
| 1. An empty report looks like supported output | A polished no-data artboard can imply that a report successfully ran, while `check_report.py` rejects an empty session cube. A user may save or share something that failed validation. | Call the proposed state **Review couldn’t start** or explicitly mark it as a proposed no-data outcome. Show what was checked and what remains unknown. Decide whether this belongs before report generation or requires a product change; never silently ship only the visual shell. |
| 2. Eligibility becomes a progress game | “One more session to unlock insights” encourages AI use to satisfy the tool. Five overall sessions may still contain zero opportunities for the particular measure. Eligibility does not establish statistical confidence. | Preserve factual activity, explain each affected measure’s qualifying work and period, and use neutral language: “Too few qualifying sessions in this period.” Show an exact remaining count only when the denominator is measured and the number truly resolves that measure. Avoid meters, locks, success badges, and blanket “ready” scores. |
| 3. Unknown coverage becomes a confident zero | An absent app path, unreadable export, stale export, or missing usage fields can be mistaken for no activity. A percentage such as “80% of history included” invents the denominator. | Keep **No activity recorded**, **History unavailable**, **Not measured**, and **No matches** distinct. Add scope adjacent to affected totals and dates. Do not show skipped totals, full-history percentages, exact export freshness, or permission diagnoses unless instrumentation actually supplies them. |
| 4. More imported data earns false improvement | An import can add old work, alter source mix, or replace overlapping weeks. A greener score after import may look like a behavior change. A saved HTML report cannot update itself. | Explain before recovery: “Add the file to your next review, then generate a new report.” Regeneration must replace overlapping history. Compare matching app scope or omit the change. Use “More history included” for coverage changes, never “Your habits improved.” A first report may already have enough old history for a comparison. |
| 5. Every missing measure points toward import | More exports cannot restore deleted raw logs, manufacture unsupported tool calls, or give estimated Gemini sessions exact IDs. A generic import CTA sends the user through effort that does not resolve the stated limitation. | Match each action to the measure and source. Missing web history can offer source-specific export instructions. Unsupported fields get an explanation without a repair CTA. Deleted logs get honest limits and an optional future-retention action. Saved aggregates can support totals while raw examples remain unavailable. |
| 6. A partial week quietly becomes a quiet week | A report generated on Tuesday can make a user appear to have declined. Removing the current week can also erase all evidence for a new user. Stale data can resemble deliberate inactivity. | Label partial dates beside the activity, e.g. “This week through 10 Nov.” Retain the only recorded activity, separate incomplete periods from comparable full weeks, and suppress partial/full-week changes. “No recorded sessions” must be scoped to the files and period; do not infer burnout, focus, low productivity, or cause. |
| 7. Recovery depends on a tooltip or stacked warnings | Keyboard, touch, and screen-reader users may miss the reason a number vanished. Multiple warning banners can leave no clear next step. Saved HTML has limited ability to act on the filesystem. | Put the principal reason and useful next step in ordinary text. Use expandable, keyboard-operable details for secondary source information. Choose one highest-value action per state. Label actions honestly: “Show ChatGPT export steps,” “Show all work,” or “Copy review request”; avoid “Import now” and “Retry” if they cannot perform that action. No essential hover-only education. |
| 8. Teaching the full experience contaminates the real result | Ghost charts, invented sample findings, or prefilled skill counts may be read as evidence about the user. The page can feel like a failed onboarding funnel instead of a truthful report. | Teach the purpose of unavailable sections in one sentence. Offer a separate, optional **View an example report** with a persistent **Example data** label. Do not mix illustrative results into real charts. With no saved skills, explain what skill review would assess and omit skill tables; with no defensible findings, show a neutral outcome instead of manufactured fixes. |

## Interaction specification review

The interaction handoff arrived after the first pass. Its explicit snapshot semantics, metric-specific availability, source-specific instructions, absence-versus-unreadable skills states, and optional comparison alternatives resolve several common failure modes. Six details still need revision before those words become canvas defaults:

1. **State 2 must not headline an unperformed check as “No sessions were found.”** A cloud run without desktop access and a review without search/export did not establish absence. Use **No session evidence was available for this review** for that umbrella state; reserve the stronger “No sessions found” wording for a verified successful check.
2. **State 5 conflates source records and sessions in its headline.** “Some sessions could not be read” implies the system knows how many sessions were lost. A malformed JSONL line may be one event within an otherwise readable session. Use **Some source records could not be read** and identify only the affected source; withhold any session loss total unless it is measured.
3. **The coverage table’s “Through” column can imply continuous completeness.** Use **Latest included session** when that is the known fact, or label the date with its exact provenance. A `logs` status can currently mean the path exists; it is not sufficient proof that usable records were read. Keep that implementation gap explicit.
4. **State 8’s overlap-skipped example implies record-level deduplication.** Existing rules replace same-week/app history rather than append duplicate weekly totals. Lead with source/date changes; do not illustrate skipped-record totals unless stable identity and diagnostic metadata become supported. The caveat in the spec is correct, but the prominent example is still the wrong default.
5. **A global “Add existing data” action is not always useful.** Unused apps, deleted raw logs, unsupported metrics, and an otherwise sufficient report do not require an import. Put recovery on the affected source row; promote one primary action only when it resolves a real, useful gap. “Back to report” is a legitimate endpoint.
6. **Eight elapsed weeks between oldest and newest records are not automatically eight comparable weeks.** The comparison must use the measure’s actual start and qualifying denominator, with both windows eligible. Keep the time explanation tied to the specific measure, not just the length of the overall date range. This also prevents a first-report onboarding gate when sufficient older logs already exist.

## Three product decisions worth asking the user

1. **Should no usable sessions produce a saved coverage-only report or a preflight result before a report is generated?** Recommended exploration: preflight result. A saved no-data report requires a deliberate validator and output-contract change.
2. **Should the next implementation add measured read/parse diagnostics, or should the design stay within today’s source statuses?** Recommended first release: honest existing statuses; keep richer diagnostics clearly marked as proposals until collection can establish them.
3. **When the report cannot show a measure, should an optional example open separately or inside an explicitly labeled example view?** Recommended exploration: a separate example view. Real and simulated data should remain easy to distinguish throughout reading, printing, and sharing.

These are product boundaries. Typography, action ordering, and ordinary disclosure details can be resolved by the designer without asking the user.

## Acceptance questions for the interaction and canvas pass

- Could someone read only the headline and metric value and mistake an unknown for zero?
- Does the action actually change the reason this specific measure is unavailable?
- Are source/status dates justified by measured data rather than file modification time?
- Does the design keep usable evidence visible while withholding only the unsupported interpretation?
- Can a first report show historical comparisons when old logs meet the requirements?
- Is sparse AI activity treated neutrally, including a valid outcome of no action needed?
- Can every primary explanation and recovery step be reached without hover?
- If the user prints or shares the HTML, do scope, partial-period, and example labels remain attached to the result?
- Does an import or source change explain why values differ before suggesting behavior changed?
- Are current metrics, comparison metrics, skills, token usage, and session estimates allowed to have independent availability?

## Actual canvas review: first pass

Reviewed **No Sessions Preflight** (`bob`), **Reading Issues Review** (`nhl`), and **Comparison Eligibility Review** (`icy`) on Wonder page `01a18e27-aa80-733d-a3df-27cf3c2a8f2c`. Inspected their content JSX and one screenshot each. This was a design review, not an interaction test; no canvas changes were made by the reviewer. The other five full screens were not independently screenshot-reviewed in this pass.

The designs now avoid false zero metrics and invented failure totals. The no-data screen visibly says no report was generated. The comparison screen preserves the supported current 60% rate, names its numerator/denominator, withholds change because the earlier sample is too small, and keeps Codex scope independent of newly added ChatGPT history. Essential explanations are visible without hover.

### Findings

| Severity | Element and harm | Revision | Status |
|---|---|---|---|
| P1 · scope blocker before implementation | `bob.ala` checks Codex only for Oct 26–Nov 8, while `bob.arn` / `bob.mob` make the broader no-evidence/no-report conclusion. Older usable history could exist. | State that this is the selected review period, preserve any older included history, and ensure the checked scope supports the no-report outcome. A selected empty period is distinct from the whole report having no session evidence. | Designer will explicitly scope the view to the selected Oct 26–Nov 8 period; final version needs the corresponding product contract. |
| P1 · recovery specification blocker before implementation | `nhl.art`, `nhl.cry`, `nhl.von` explain three different failures, but `nhl.spa` offers one generic **Copy recovery steps** action without showing what the copied instructions contain. “Check file access in that assistant” does not identify the source or next check. | Put source-specific actions beside each issue and show the copyable request before copying. Ask the assistant to inspect the named source/failure and regenerate; do not imply the report can repair permissions or imports. Parser failures need a fresh supported export or diagnostic investigation rather than a guaranteed retry fix. | Designer will add row actions and a visible prompt. No actual clipboard behavior was tested. |
| P1 · sample labeling blocker before publishing examples | The example-data notice sits only at the bottom of the sidebar (`bob.fcc`, `icy.fat`, corresponding `nhl` method note). A cropped main panel or print layout that hides navigation could present fixture values as personal evidence. | Add **Example report · Illustrative data** to the main opening. Preserve that label in print/share output alongside results. | Designer will add a main-header label to every full screen. Print/share behavior remains an implementation test. |
| P2 · evidence refinement | `nhl.jab` claims retained findings remain available, but the screen does not show how partial source context qualifies one of those findings. Users cannot see the boundary between usable counts and unsupported interpretation. | Show one supported finding scoped to its actual source/records. Add an affected-measure notice where missing events could alter the measure; readable events alone do not prove a complete session. | Designer will add one scoped retained-finding example. |
| P2 · consistency refinement | `bob.doc` and `nhl.cvs` have bottom borders even though they are the final rows in their lists. | Remove only the final internal divider and retain the containing card border. | Designer reports these were removed, including corresponding rows on Add History and Updated Report. |

P1 findings above are conditions for implementing or publishing the proposed states. They do not block keeping clearly labeled exploratory canvas designs for discussion. Unknown read/parse statuses still require collector instrumentation before production can state them as facts.

### Additional blocks: code/tree-only review

Reviewed **Filtered Sessions Empty** (`big`), **No Saved Skills** (`how`), and **No Strong Findings** (`pie`) without additional screenshots. No new blocker was found, subject to these implementation conditions and copy refinements:

- `big.ent`: **Clear filters** must actually restore the advertised 38 included sessions, including resetting the period when needed. Specify that reset contract or use **View all included sessions**. The 38 is explicitly illustrative and verified within the fixture; this is acceptable, and must become measured metadata in real reports.
- `how.usc`: change “this section can check them” to **A future review can check saved skills for stale facts and missed updates.** A saved HTML report does not scan files added after generation.
- `how.per` and `pie.has`: show links to session findings or included evidence only when a real target and usable evidence exist. Verified no-skill files does not imply session findings are available.
- Keep a separate **adequate evidence, no actionable change** outcome. `pie.jun` currently describes evidence too weak for a recommendation. A thorough review can also find no change worth suggesting. That state should say **No changes to suggest for this period**, with no request for more data.

### Remaining review limits

No keyboard, clipboard, destination-link, screen-reader, mobile, printing, collector-diagnostic, or regeneration behavior was tested. The report remains a snapshot and all primary actions need honest static-report destinations. Source-specific recovery, unsupported metrics, no saved skills, and no findings must each preserve their independent availability rules. New diagnostics and a no-session artifact must not become production claims through design copy alone.

## Files and scope

Changed only `docs/design/` in `/Users/zhouyou/Documents/GitHub/second-look`. No production or canvas changes.
