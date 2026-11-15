# Saved acceptance checks

## 2026-11-15 — Rule savings include response waits

- [ ] All five `#part-2 .try` sections contain one platform-specific `.try-do` instruction and one `.field pre` with a working Copy control; their prompt text matches the approved canvas design.
- [ ] `#try-rules .try-saves` says "Saves retyping and waiting for extra replies" and explains that total time saved isn't measured.
- [ ] `#plan .plan-saves` for `#try-rules` says "Retyping and waiting for extra replies"; the report contains no "5 minutes a week" or "under a minute each" savings claim.
- [ ] At 1440, 1280, 720, 375 and 320px in dark and light, the savings line, explanation and plan row wrap inside their containers; the Copy control and plan-to-fix navigation still work.
- [ ] On production, follow the landing page's report link, open Briefs & setup, and check both savings locations and the explanation. Served HTML matches the committed template; no uncaught browser errors occur.

## 2026-11-13 — App and Project filters

- [ ] Run `python3 -m unittest discover -s tests -p 'test_*.py'`: all eight synthetic data tests pass.
- [ ] Run `tests/report-designs.mjs` with Playwright: desktop/phone dark/light, exact dates, legacy data, reset and project intersections pass.
- [ ] At `/sample-report.html#part-1`, `#f-source`, `#f-cat` and `#f-project` each have an associated label; the last `#f-project option` is Unknown when missing-project rows exist.
- [ ] Unknown stays last even when it contains more sessions than each named project; legacy rows remain counted.
- [ ] At 1440, 1280, 720, 375 and 320px, `.filters.scrollWidth <= .filters.clientWidth` and the document does not overflow horizontally; at mobile widths, select targets are at least 44px tall.
- [ ] Select Project, App and Work, then change Time: selections persist; counts, charts and tables use the project. Switching all five Habits tabs preserves the same count and filter selection.
- [ ] `#f-reset` restores All projects, All apps, All work and the default Time; `#f-clear` does the same from a no-match result.
- [ ] On production, cold-load `/second-look/sample-report.html#part-1`, choose Unknown, then clear; no uncaught browser errors occur. Served HTML matches the committed report template.
