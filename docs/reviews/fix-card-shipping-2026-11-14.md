# Fix-card shipment — November 14, 2026

Melissa approved this hierarchy on November 12 and asked to ship it on November 14 in the current Wonder conversation. Conversation ID and transcript URL are unavailable; these are date-only references to visible messages.

Source design: Briefs And Setup Dark Matched. Tracking: MEL-47.

## Shipping scope

- `plugins/second-look/skills/second-look/report-template.html`: five fuller summaries, native collapsed evidence disclosures, supporting quotes/comparisons inside them, and print expansion with state restoration. Reuses `.icard`, `.nested`, `.body`, `.ic-grid`, the existing chevron, tokens and glossary tooltips.
- `plugins/second-look/skills/second-look/SKILL.md`: generation instructions for the approved hierarchy.
- `plugins/second-look/skills/second-look/references/design-system.md`: the matching pattern and disclosure guidance.
- `tests/report-fix-cards.mjs`: keyboard, script-disabled, narrow-screen and print regression checks.
- This review record.

The separate uncommitted project/history changes are excluded, including changes in the same report and guidance files. A patch from the captured pre-task files isolates this shipment. Validation runs against committed HEAD plus that patch in `/tmp/second-look-fix-cards-2026-11-14/shipping`.

The “session” wording follows GLOSSARY.md; the two affected summaries were synchronized on both canvas screens. The separate cross-app action redesign and automatic-fixes proposals are excluded. Both screens already reside on launched, so no move is needed. The earlier standalone card exploration remains deleted.

## Verification

- Eight synthetic Python data tests; report design and palette checks.
- Existing report browser regression suite at 1440, 390 and 320px in dark/light modes, including filters, exact dates, projects, legacy data and conditional empty states.
- New evidence checks at the same six width/theme combinations: collapsed defaults, two labelled evidence groups, Enter/Space toggling with focus retained, unchanged action visibility, nested rule comparison, supporting quote, visible-content fit, print expansion and restoration of each prior open/closed state.
- Native disclosure tested with JavaScript disabled.
- ESLint, generated Next.js route types, TypeScript and production static export. The exported sample report is byte-compared with the shipping template.
- Canvas screenshots and rendered report screenshots reviewed. QA artifacts: `/tmp/second-look-fix-cards-2026-11-14/qa`; general regression artifacts: `/tmp/second-look-fix-cards-2026-11-14/regression`.

Next.js route types must be generated before TypeScript checking in a fresh snapshot (`next typegen`). The isolated build uses its own dependency copy because Turbopack refuses a dependency symlink outside its root. Google Fonts require network access during the normal production build.

## Surfaces and remaining checks

The sample route serves the template directly; no generated source copy is added. The Overview is unchanged, so its landing screenshot stays unchanged. README, landing copy/metadata, FAQ, listings, install commands, privacy claims and glossary terms do not describe this internal card hierarchy and need no changes for it. GitHub About already matches the canonical description and was read only.

Pre-existing findings reported, outside this shipment:

- At 320px, the hidden `#def-skill-part2` glossary tooltip extends the document to 330px. Reproduced in the captured pre-change template and after this change. Visible summary, evidence and action boxes fit; this suite does not claim zero document overflow.
- The committed skill frontmatter description predates the canonical one-line description; the separate local project/history work changes it. That unrelated hunk is excluded here.

Before publication, follow AGENTS.md: commit these files, then ask Melissa whether to rebuild the release ZIP or push only. The latest release at verification time is v0.5.0. Even before this ship, the skill directory differs from that tag in the template, design guidance and collector. No release/version/tag changes are authorized until she chooses.

After publication, confirm the Pages deployment, follow the landing page's actual report link, test production disclosures and compare served HTML with the committed template. Record the final deploy/release evidence in MEL-47 and HANDOFF.md.
