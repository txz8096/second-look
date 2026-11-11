# Pink-first chart color practice — canvas rollout

Melissa approved applying the single-preview direction to every matching screen on the launched page of **second look sample report**. Updated the existing screens in place; no artboards were created or moved. The canvas rollout came first; the subsequent “ship it” request authorizes implementing and publishing this same direction in the report. Public metadata is outside this chart change.

Use as few colors as the information needs within a chart and across a chart group. Independently labeled single-series charts and labeled bars in separate rows use pink first. Use multiple hues when stacked or overlapping categories need differentiation, with clear legends or direct labels. Do not introduce outlines, hatching, shadows or line underlays.

## Color changes

All replacements reuse the existing `candidate-chart/pink` token (`#e6308a`) for HTML marks. SVG trend artwork retains the exact palette value because Wonder does not render token-variable SVG strokes correctly (previously reported). The SVG paths, points, dates, labels, annotation lines and chart dimensions are unchanged.

| Role | Previous fill or stroke | Applied color | Reason |
|---|---|---|---|
| Clarity trend series | Blue `#0073e6` | Pink `#e6308a` | Each chart has its own title and one series |
| Checking trend series | Green `#5ba300` | Pink `#e6308a` | Each chart has its own title and one series |
| Delegation trend series | Orange `#c44601` | Pink `#e6308a` | Each chart has its own title and one series |
| Usage trend series | Deep pink `#b51963` | Pink `#e6308a` | One consistent pink across independent charts |
| Automation trend series | Pink `#e6308a` | Unchanged | Already matches the rule |
| What you used AI for | Category orange, deep blue, bright orange, light blue, blue | Pink `#e6308a` | Separate rows already label each category |
| Where you worked | Blue or mixed category/group colors | Pink `#e6308a` | Separate rows already label each app |
| What you handed off | Light blue, green, orange | Pink `#e6308a` | Separate rows already label each task type |
| Coverage data marks and Data legend | Blue `#0073e6` | Pink `#e6308a` | One data state; neutral unavailable states retain their existing meaning |
| Overview stacked activity and legends | Existing category colors | Unchanged | Stacked categories need differentiation and an existing matching legend |

## Scope and verification

- Read all 43 artboards. Changed 21: all 15 Habits screens and all six Settings screens, including desktop/mobile, dark/light, expanded and filtered states.
- Changed 187 HTML bar/coverage fills and 35 trend artworks; five previously previewed bars and 20 existing pink trend artworks already matched. The final page contains 192 pink HTML marks and 55 pink trend artworks.
- Left 22 artboards unchanged: nine Overview screens whose stacked categories and legends carry meaning, plus 13 screens without affected chart marks.
- Read back all 43 artboards. Each code subtree exactly matched its original plus the intended color substitutions. This checks that labels, values, geometry, controls, legends and data-access links were preserved.
- Captured all 21 changed artboards after their final edits. Reviewed representative desktop/mobile, dark/light, expanded, filtered, helper-agent and coverage screens. Finished all 21 artboards.
- Pink contrasts 4.40:1 against dark cards (`#171717`), 3.71:1 against dark tracks (`#262626`) and 4.07:1 against white. It is used for chart marks here; text colors were preserved. Existing stacked-palette limitations from the prior accessibility audit still apply; this is not a full-site WCAG certification.
- Updated AGENTS.md and design-system guidance to record the approved direction. Existing uncommitted wording edits are preserved and excluded from the shipment. Canvas verification is separate from the implementation checks below.

[Habits Clear Dark Matched](https://app.wonder.so/melissa-tang/files/01a1a83e-7866-73b5-bbba-494e6ae1cb06/branches/main/pages/01a1bef0-8041-7008-9cc4-cb755cd1295f?nodeId=54616f80-b307-5d77-85f6-e20606797790)

## Implementation shipment

The existing `chart()`, `bars()` and `handoffCard()` functions and coverage styles use the shared pink `--series` token in both themes. Removed the group-specific trend colors and row-specific share-bar colors. `categoryPaint()` remains responsible for the stacked Overview chart and its legend; its mapping and sample data are unchanged. No new components, colors, icons or chart geometry were introduced. The skill instructions, design-system reference, project guidance, palette checker and release package follow the same rule.

Source declarations: both `--series` theme values changed from `var(--chart-blue)` to `var(--chart-pink)`; `.btrack span` now uses `var(--series)` without the categorical override; `.seg-data` changed from blue to `var(--series)`. The color-role table above lists the old and new chart colors.

Implementation checks passed at 1440, 390 and 320 CSS pixels in both themes. Verified computed pink fills/strokes across all five trend groups and labeled bars, then changed the date range, work category and app filters and checked the colors again. Stacked marks still match their multicolor legend. Data disclosures open and close with Enter, activity tables have 13 weekly rows with correct totals, and no script errors were reported. Report/palette checks, prerendered table retention, production webpack build and TypeScript passed. The isolated shipment has the same scripts/styles as the tested working source; pre-existing wording changes remain outside it. The existing sample preview image is an Overview screenshot whose chart treatment is unchanged.
