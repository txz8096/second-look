import { Container, Kicker, SectionHeading } from "./ui";

const INSTALLER_SETUP = "None. The installer links the skill in";

const columns = ["What’s read", "Setup needed", "How far back"];

const tools = [
  {
    name: "Claude Code",
    reads: "Session logs in ~/.claude/projects, your skills and CLAUDE.md",
    setup: INSTALLER_SETUP,
    history:
      "Last 30 days only. Claude Code deletes older sessions unless you raise cleanupPeriodDays in ~/.claude/settings.json",
  },
  {
    name: "Codex",
    reads: "Session logs in ~/.codex/sessions, your skills and AGENTS.md",
    setup: INSTALLER_SETUP,
    history: "Full history. Nothing to change",
  },
  {
    name: "Cursor",
    reads: "Chats in Cursor’s local database, plus .cursor/rules",
    setup: INSTALLER_SETUP,
    history: "Full history. Nothing to change",
  },
  {
    name: "Antigravity",
    reads: "Agent transcripts in ~/.gemini/antigravity-cli, plus ~/.gemini/GEMINI.md",
    setup: "None. Reviews start from one of the tools above",
    history: "Whatever the CLI keeps on disk. Support is new, and app chats may be missing",
  },
  {
    name: "claude.ai",
    reads: "conversations.json from your data export",
    setup: "Export it from Settings → Privacy, then put it in ~/.second-look/exports/claude",
    history: "Optional. Covers everything up to your export date",
  },
  {
    name: "ChatGPT",
    reads: "conversations.json from your data export",
    setup: "Export it from Settings → Data controls, then put it in ~/.second-look/exports/chatgpt",
    history: "Optional. Covers everything up to your export date",
  },
];

export function Coverage() {
  return (
    <section id="coverage" className="border-t border-rule bg-surface">
      <Container className="flex flex-col gap-12 py-20 lg:py-28">
        <div className="flex max-w-[760px] flex-col gap-5">
          <Kicker>Coverage</Kicker>
          <SectionHeading>Supported AI tools</SectionHeading>
          <p className="font-body text-[17px] leading-[1.55] text-text-2">
            Start a review from Claude Code, Codex or Cursor, and one run covers every source below that’s on this
            computer.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="max-md:sr-only">
            <tr className="border-b border-rule">
              <th
                scope="col"
                className="w-[160px] pr-8 pb-3.5 font-mono text-xs leading-normal font-normal tracking-[1px] text-text-3 uppercase"
              >
                Tool
              </th>
              {columns.map((col, i) => (
                <th
                  key={col}
                  scope="col"
                  className={`pb-3.5 font-mono text-xs leading-normal font-normal tracking-[1px] text-text-3 uppercase ${
                    i === columns.length - 1 ? "w-[260px]" : "pr-8"
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tools.map((t) => (
              <tr key={t.name} className="border-b border-rule max-md:flex max-md:flex-col max-md:gap-3 max-md:py-5">
                <th
                  scope="row"
                  className="py-4 pr-8 align-top font-body text-[15px] leading-normal font-semibold text-ink max-md:p-0"
                >
                  {t.name}
                </th>
                {[t.reads, t.setup, t.history].map((value, i) => (
                  <td
                    key={columns[i]}
                    className={`py-4 align-top font-body text-[15px] leading-normal max-md:flex max-md:flex-col max-md:gap-1 max-md:p-0 ${
                      i === 2 ? "text-text-2" : "pr-8 text-text-2"
                    }`}
                  >
                    <span className="font-mono text-xs tracking-[1px] text-text-3 uppercase md:hidden" aria-hidden="true">
                      {columns[i]}
                    </span>
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Container>
    </section>
  );
}
