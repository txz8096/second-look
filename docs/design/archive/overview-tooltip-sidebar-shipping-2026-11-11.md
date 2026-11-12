# Overview details and pinned navigation

Melissa approved the existing Overview tooltip preview and then the sidebar footer preview. This shipment replaces the Overview's visible “View chart data” disclosure with weekly detail tooltips and keeps navigation information at the viewport bottom.

## Implementation

- Reused the report's weekly aggregation, category mapping, chart-data helper and sidebar. No data fixtures, chart colors or category assignments changed.
- Overview week buttons expose their full values through accessible names. Hover or focus opens a neutral tooltip with the week, total and category counts; Enter/Space or tap toggles it. Escape stays dismissed until further pointer movement or deliberate focus; outside taps dismiss it. It remains hoverable and repositions during scrolling. On narrow screens it moves above or below the trigger, with internal scrolling when needed.
- The Overview retains a visually hidden table with captions and headers, visible in print. Habits trend disclosures remain unchanged. Prerendered reports retain the values when scripts are blocked.
- The desktop sidebar is sticky beneath the 64px app bar and fills the viewport's remaining height. About and the guidance access remain at its bottom while the report scrolls. Long references scroll inside the sidebar; short viewports constrain the method note and navigation. The phone drawer and print layout retain their existing behavior.
- The landing hero is a separately generated image and report link. Refreshed that image from the isolated release template; the unused SampleReport component is unchanged.
- Updated SKILL.md and design-system.md so generated reports follow the same behavior. Plugin version: 0.3.7. The release zip is built from the committed skill.

## Canvas

Existing launched artboards were edited in place. Thirty sidebar copies now match the approved viewport-sized preview (31 including that preview), and six Overview tooltip copies match the approved one (seven total). The navigation-open phone state has no active tooltip. Hidden-sidebar phone states need no footer placement change. The older Orange & Blue iteration was no longer present when this shipment started. Edge-case drafts were excluded.

All affected roots were captured after editing. Reviewed the tooltip screens and a contact sheet of every remaining changed sidebar; read back all 31 sidebar heights. Finished 33 changed artboards; the original approved preview was already finished. Wonder's canvas stores static placement rather than sticky scrolling, so scrolling was verified in the implementation.

## Verification

- Headless Chrome: 1440, 390 and 320px in dark/light themes; all 13 weekly totals and geometry; tooltip values, viewport bounds, hover persistence, focus and Escape; all five pages' footer position, report scrolling, and a 400px-high viewport. Separate touch-context checks cover toggle and outside dismissal. No page errors.
- Visual inspection caught inherited 36px button sizing clipping the bars. Corrected it and added assertions for full 160px plot height and weekly stack heights. Verified the final screenshot.
- Source report and palette checks, whitespace checks, TypeScript and the production Pages-base-path build.
- Actual landing hero/image and same-tab report link checked against isolated release assets. Equivalent tables and trend disclosures checked in a prerendered, script-blocked report.

Earlier uncommitted fix-review wording and edge-case notes remain outside this commit. Shared-file release copies were prepared from HEAD; before/after comparisons verify that the working tree preserves those earlier drafts exactly. Existing unrelated mobile content overflow and GitHub About copy drift remain outside scope.
