# Chart palette rollout — 2026-11-11

Updated the report's stacked activity bars, all five trend groups, category/source share bars, helper-agent breakdown and coverage timelines with the user-provided chart colors. Category and source mappings stay stable when filters or available categories change. Brand/action colors remain separate.

The user rejected the added black/white outlines and hatch patterns. The final design uses solid fills and the original chart geometry, gaps, grid treatment and line weight. Removed all added mark shadows, hatch patterns, timeline outlines and line underlays from 30 launched artboards. No artboards were created or moved. The 22 edge-case artboards were inspected and contain no chart marks requiring this treatment.

## Accessibility scope

The palette's text pairings pass 4.5:1 with the specified black or white text. Solid chart fills do not universally meet 3:1 against surfaces or each other; the November 10 audit remains valid about those limitations. No blanket palette or full-site WCAG certification is claimed.

Every populated activity chart and trend card now provides a keyboard-accessible **View chart data** disclosure containing the same categories, dates and values, with proper table captions and row/column headers. The equivalent values route provides information without requiring color discrimination. Missing values remain missing. Helper-agent share bars have explicit labels, values and a values table. Coverage retains its existing text statuses and unavailable-history treatment.

The source reuses the existing chart/card/filter functions; no new application component was forked. `scripts/prerender.py` also preserves the activity chart and its table for generated reports. `scripts/check_chart_palette.py` checks the palette text pairings and required table route; it explicitly does not certify every solid graphical pairing.

## Verification

- Browser checks passed at 1440, 390 and 320 CSS pixels in both light and dark themes: six states. Navigated through the mobile menu and every chart group. Data disclosures opened and closed with Enter, activity tables contained 13 weekly rows and correct totals, and all charts had their expected data tables. No script errors.
- Confirmed that activity marks have no background patterns or box shadows, and trend lines have no added white underlay.
- Read back all 30 changed canvas artboards: no added chart-ink styles remain, and data-access controls have no duplicates. Captured every changed artboard after its final edit; visually reviewed representative desktop/mobile and both themes.
- `check_report.py` and `check_chart_palette.py` passed for the working template and the isolated shipment template. Their scripts and styles are identical.
- Production webpack build and TypeScript checks passed. The site's existing GitHub Pages workflow builds the pushed commit.
- Pre-existing uncommitted wording changes in SKILL.md, design-system.md, report-template.html and the prior preview image were isolated from this shipment and remain in the working tree. Their text deltas were checked against the pre-task snapshot.

## Surface check

Updated the report template, skill instructions, design-system reference, prerender/check scripts, report preview image and plugin version. The landing page embeds the template at build time, so its sample report follows automatically. README/FAQ, marketplace description, install commands, privacy claims and glossary have no chart-palette promises requiring changes. A new release zip is required for the skill update. The existing GitHub About description still uses older wording; changing it is outside this chart shipment.

## Canvas rendering note

Wonder did not render SVG strokes using file-token CSS variables. Reported the issue and used the exact user-supplied hex colors inside SVG artwork. Other canvas chart fills retain token bindings. The website uses its native CSS variables normally.
