# Remove default chart-data links

Melissa approved removing the persistent “View chart data” access from every visualization. Add separate data access only when a clear user need calls for it. The canvas already reflects this rule: 57 disclosures were removed from 15 Habits artboards, with exact before/after checks, screenshots and a page-wide search confirming none remain.

This shipment reuses `chartData()` to provide equivalent labeled tables without visible disclosures across Overview, trend cards and the helper-agent breakdown. Values remain available to screen readers and appear in print. Existing chart labels and point tooltips remain. Removed unused disclosure markup, styles and the extra screen-layout row; all graphs retain their original geometry and colors. Ordinary report tables are unchanged.

AGENTS.md, SKILL.md and the design-system reference record the general rule. The palette checker now checks for the equivalent data route without requiring disclosure UI. The release zip is built from committed source, with plugin version 0.3.8.

Verification:

- Compared every group and a filtered state against v0.3.7 at 1440, 390 and 320px in both themes. Chart paths, values, colors and ordinary tables match; visible chart-data links are absent. Print tables remain available, and no page errors occurred.
- Reviewed final desktop and phone chart screenshots. Checked prerendered chart values with scripts blocked, including print visibility.
- Report and palette checks, whitespace checks, TypeScript and the production GitHub Pages build passed.

The landing hero depicts Overview, which already had no disclosure, so its committed image stays unchanged. The landing report link receives the updated template through the normal build copy. README, glossary, landing copy and plugin listing descriptions contain no chart-disclosure promise requiring a change. Earlier fix-review wording and screenshot drafts, all edge-case concepts and the four edge-case notes remain outside this shipment.
