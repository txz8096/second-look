# Product Excellence Review — Briefs & setup prompts and savings

Reviewed at: 1440×900, 1280×900, 720×450, 375×900, 320×900, dark/light · Console: clean · Scope: five action panels and the matching plan
Verified on: local production build · Regressions: 0 of 8 saved filter checks · Browser risk: existing native popover has a fallback; text-wrap is cosmetic; this change adds no CSS or browser APIs

## Verdict

Ship, then confirm on production — the approved prompts, savings explanation, Copy controls and plan pass the scoped checks. The two inherited findings below are outside this shipment.

## Findings

| # | Pri | Effort | Pass | Finding |
|---|-----|--------|------|---------|
| 1 | P1 | S | Content | Pre-existing skill frontmatter description differs from the canonical one-line description |
| 2 | P2 | S | Launch | Pre-existing landing metadata has no Open Graph image |

### 1. [P1·S] Skill listing description still drifts

- **Evidence:** committed `SKILL.md` frontmatter begins “Reviews how you work with AI”; the served landing description and GitHub About use “Second Look reviews your AI conversations across your apps, finds recurring problems, and recommends fixes to try.” The separate uncommitted terminology edits are not part of this ship.
- **Why it matters:** readers see different descriptions depending on where they find the skill.
- **Fix prompt:**

> In a separate approved copy change, reconcile SKILL.md's frontmatter with the canonical description in AGENTS.md, preserving required skill triggers, then check the README, landing metadata, GitHub About and plugin listings. Do not include unrelated uncommitted terminology or history work.

### 2. [P2·S] Landing share metadata has no image

- **Evidence:** the built landing page has a title, description and resolving icon but no `meta[property="og:image"]`. This metadata predates the prompt changes; the report's Overview and landing screenshot are unchanged.
- **Why it matters:** a shared landing-page link may have no useful image preview.
- **Fix prompt:**

> In a separate approved landing-page task, add Open Graph and Twitter metadata in src/app/layout.tsx using an existing approved share image or request one. Verify the built image URL resolves and the title and description agree with the visible page.

## What's working

- All five actions use one named app and one paste-ready prompt. Existing `.try`, `.field`, `pre`, `.copy` and plan markup are reused; no new component, styling literal or runtime handler was needed.
- Rule savings account for retyping and waiting for additional AI responses. The explanation retains the sample frequency and explicitly says total time saved is unmeasured. The card and plan agree.
- Prompt text and platform instructions match the updated Briefs And Setup Dark Matched canvas screen. Fresh-session steps and model-switch limitations remain explicit; the beta prompt retains the review-skill dependency.
- All five Copy controls copy their own full prompt. Evidence remains keyboard-operable, and the existing no-script and print checks pass.
- The page fits at all tested widths. The previous hidden review-skill tooltip made the 320px document 330px wide; removing its superseded helper paragraph as part of the approved design leaves the new document at 320px.

## Verification evidence

- Isolated committed HEAD `cb16ac3` plus only this shipping patch. No personal logs or app configurations were read.
- Eight synthetic Python data tests; report design and chart-palette checks; ESLint; TypeScript; production build. Exported `/sample-report.html` matches the template byte for byte.
- Existing `tests/report-designs.mjs`: six width/theme combinations, exact dates, legacy rows, App/Work/Project intersections, reset, empty recovery and conditional states.
- Existing `tests/report-fix-cards.mjs`: six width/theme combinations, native keyboard disclosures, supporting evidence, print restoration and script-disabled behavior.
- Scoped browser checks: actual landing report link; all five prompt texts and instructions compared with canvas text; ten width/theme combinations; Copy controls; plan navigation; anchors; contrast of changed savings text; no uncaught page errors. Minimum measured contrast for changed savings text: 5.69:1.
- Personas: a laptop skimmer follows the landing link and finds the rule fix; a skeptical reader compares the benefit with its measurement caveat and plan; a keyboard user follows the plan and opens supporting evidence. The core flows complete.
- Temporary test server started and stopped by the browser harness. Evidence and the harness are under `/tmp/second-look-savings-ship-2026-11-15/`; screenshots in `local/`, regressions in `regression/`, disclosure checks in `disclosures/`.

## Surface and shipping scope

The template, SKILL.md savings/action guidance, design-system guidance, saved acceptance checks and this record ship together. Source snapshots and reverse-patch checks protect unrelated edits in shared files.

README, listings, installation, privacy claims, glossary, landing metadata and screenshot need no prompt/savings changes. The existing description drift is reported above. The source canvas already sits on launched, so it needs no move. The separate proposal was no longer present when refreshed; the existing source screen was updated in place using the approved text retained in this conversation.

The latest release is v0.5.0 and was already behind the committed skill folder. Follow AGENTS.md after committing: the author chooses a new release/ZIP or push-only. No version, tag or release is changed before that choice. After deployment, verify the actual production landing link, prompt contents, Copy controls, both savings locations, responsive fit and served bytes; record the deployment result and release decision in MEL-48 and HANDOFF.md.
