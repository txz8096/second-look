# Wonder design sync after v0.3.9

Melissa requested implementation and shipment of the Wonder changes since commit `2333c96` (v0.3.9). This supersedes the design-only status of the approved changes below. Source: **second look sample report**, main branch, launched page. The page already holds these designs; no new artboards or canvas edits were needed.

## Implemented changes

| Wonder designs | Product implementation |
| --- | --- |
| Approved Time dropdown and 18 matching filter areas | One shared `.filters` component in `report-template.html`: four presets, From/To fields, validation, immediate preset selection, draft dismissal, Clear filters and session count at the far right. Coverage is below. Phones retain Time/count together and wrap App/Work controls with 44px targets. Existing app/work behavior and default range are retained. |
| No Matching Sessions / Filtered Sessions Empty | Explicit no-included-matches result, measured outside-selection total and reset. Missing coverage is a separate state. |
| No Saved Skills With Resources | Built-in `.skills-empty` component controlled by verified `data-skills-state="none"`: discovery first, skills.sh and Anthropic resources, one secondary authoring guide, and “Reuse across AI apps” with the supported-features qualification. Uses existing `.dests` / `.dest` rows, border and dividers. |
| Updated No Sessions Check | Collector preflight identifies no session evidence. Skill instructions produce a source check in the assistant before generating a findings report; offer a skills check only when readable saved files exist. No zero-data findings report or fabricated absence claim is introduced. |
| Updated Report With New Export / Explore | Existing normal Overview summary, 13-week activity chart and Briefs & setup / Skills / Habits & usage destinations already match the corrected design. Guidance explicitly preserves and recomputes them after imports; duplicate import-confirmation cards are omitted. |
| Source Instructions / Coverage Settings | Export disclosures retain source-local actions, detailed source-specific steps and a visible copyable assistant request. Reports remain saved snapshots. Measured latest-session dates replace ambiguous export-date claims; file timestamps cannot establish session coverage. |
| Unsupported Measures / Comparison Not Ready | Existing unavailable-field states remain. Comparisons now also withhold change when participating source scope differs between windows. Current facts remain; no unsupported Up/Down claim. Custom comparisons require eight complete weeks and qualifying denominators. |
| No Actionable Issues | Built-in `.briefs-empty` state, using `data-findings-state="none"`, preserves trends and omits invented fixes. Generation guidance removes sample cards, plan and stale links. The checker accepts a missing plan for this explicit state. |

The two no-skills candidates share verified-absence semantics. The later resource-rich candidate that Melissa edited supplies the implemented discovery content.

## Data and component mapping

The website serves the product's single-file report at `/sample-report.html`; its build copies the source template into `public/`. The landing page links to that report and uses a separate Overview screenshot. No React component needed to be forked. The landing screenshot is unchanged because the default Overview still has the same summary, chart and destinations; filters live on Habits & usage and conditional states appear only when applicable.

Extended the existing filter, chart, coverage and copy-field components. New HTML subcomponents are the anchored nonmodal time picker (no prior date-range control existed), skill-discovery content and no-actionable-findings result. They use report fonts, neutral surfaces, borders, radii and existing destination rows. The 142px trigger and 320px menu follow the approved design; narrow screens constrain the menu to the viewport. No new colors or icon library. Existing chevron SVG and native date-input affordances are reused.

The collector now retains additive daily totals inside weekly cube rows, without raw session content or identifiers. This makes inclusive partial-week filtering exact while preserving weekly totals and week/app replacement semantics. The checker rejects daily/weekly mismatches and dates outside a row's week. Legacy rows remain valid: a custom range cutting through a weekly-only row cannot apply and explains how to select complete weeks or regenerate from original logs. Real totals are never prorated. The sample's daily fixtures are explicitly illustrative and preserve all original weekly totals and source cutoff dates.

## Verification

- Five synthetic Python tests: daily/weekly conservation, Monday/Sunday boundaries, malformed daily payload rejection, export-file-date provenance, legacy history and no-evidence preflight.
- Browser regression suite in `tests/report-designs.mjs`: 1440/390/320, dark/light; desktop row, phone count alignment, menu bounds, presets, invalid/reversed/blank drafts, Escape/focus restoration, exact single-day filtering, app/work preservation, reset, empty recovery and earliest report dates. Known daily fixtures verify 7 sessions on Oct 18, zero on Oct 13–17 and reset to 112, without leaking a newer 100-session week. Legacy history accepts complete weeks and rejects partial weeks.
- Conditional skills resources, correct list dividers, phone wrapping, no-findings output and unchanged Overview chart/destinations. Screenshots reviewed in `/tmp/second-look-designs-qa`.
- Report and palette checks, Python compilation, TypeScript, ESLint, whitespace check and GitHub Pages production build. Prerender checked for script-blocked viewing; final build, published report and release ZIP are checked against the committed source before completion.

Run browser checks with Playwright installed, or set `SECOND_LOOK_PLAYWRIGHT` to its module directory. Optional `SECOND_LOOK_CHROME` selects the browser; `SECOND_LOOK_QA_DIR` keeps screenshots/fixtures. Run data tests with `python3 -m unittest discover -s tests -p 'test_*.py'`. No personal session logs were read during verification.

## Surface sync and boundaries

`SKILL.md`, design guidance, template, collector/checker, README's saved-history description and release v0.4.0 agree. Plugin listing version is updated; descriptions, supported tools, install flow and privacy scope do not change. Landing components/FAQ and glossary do not duplicate the changed filters or conditional copy. GitHub About still has the previously reported description drift and is unchanged because editing it needs separate approval.

Richer permission, partial-parse and invalid-export diagnostics remain deferred by the selected first-implementation scope. Their historical mockups are not implemented or claimed as shipped. Source path/status metadata cannot support their fixture failure counts. No automatic uploads, retries or live mutation of saved reports were added. No saved diagnostic report is promised for zero evidence; the selected outcome is an assistant preflight. New generated reports use these rules; previously saved private reports are snapshots and are not rewritten by a website deployment.
