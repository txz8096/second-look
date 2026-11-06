## Layout

This repo holds two things. The skill lives in `plugins/second-look/skills/second-look/`, starting from `SKILL.md`, and `install.sh` installs it. The website lives in `src/`, built with Next.js and deployed to GitHub Pages. The Next.js notes below apply only to `src/`.

## Keep every surface in step

A change that affects what second look does, says or looks like is finished only when every surface below agrees with it. Before you report work as done, check each surface the change touches, update the ones that drifted, and name any you left and why. In the same pass, fix or report any other drift you see on those surfaces.

The product is the source of truth: `SKILL.md`, the scripts and `report-template.html`. Marketing follows it. If a surface promises something the product doesn't do, change the copy or raise it with the user. Never leave the promise in place, and never add product behavior just to make the copy true.

| Surface | Where | Notes |
|---|---|---|
| Skill | `plugins/second-look/skills/second-look/SKILL.md`, `references/design-system.md`, `scripts/`, `install.sh` | The `description` in the `SKILL.md` frontmatter is also marketing copy |
| Report template | `plugins/second-look/skills/second-look/report-template.html` | Published as `/sample-report.html`. `public/sample-report.html` is a build copy, so never edit it |
| Landing page | `src/components/`, metadata in `src/app/layout.tsx` | `SampleReport.tsx` embeds `/sample-report.html`, so the report updates it. `Faq.tsx` is a hand-kept copy of the README FAQ and doesn't update itself |
| GitHub README | `README.md` | Repeats the tool table, schedule table, install steps, privacy and FAQ |
| GitHub About box | Outside the repo. Read with `gh repo view --json description,homepageUrl`, change with `gh repo edit` | Ask before changing it, because it's public |
| Plugin listings | `plugins/second-look/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | |
| Release zip | `second-look.zip` on the latest GitHub release, linked from the README's claude.ai install | Holds a copy of the skill from release day. Tell the user when a skill change needs a new release |
| Word list | `GLOSSARY.md` | The report's words and the ones to avoid |

These must match everywhere they appear:

- The product name, always lowercase: second look
- The one-line description: "Reviews how you work with AI across Claude Code, Codex, Cursor, Antigravity, claude.ai, ChatGPT and Gemini, and keeps your skills current."
- The supported tools, and what each one reads and can do
- The report's part names, sections and what a finding contains
- Review cadence and time windows
- Install commands
- Privacy claims
- Sample data that appears on more than one surface

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
