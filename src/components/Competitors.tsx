import { Container, Kicker, SectionHeading } from "./ui";

const tools = [
  { name: "Claude Reflection", helpsWith: "One assistant only" },
  { name: "My Chatbot History", helpsWith: "Chat exports, no next steps" },
  { name: "ModelCoach.ai", helpsWith: "Live coaching, no history" },
  { name: "Promptfoo", helpsWith: "Tests systems, not habits" },
];

const additions = [
  { title: "Works across tools", desc: "One report for Claude Code, Codex, Cursor and more." },
  { title: "Checks your setup", desc: "Reads your skills and config too." },
  { title: "Follows up · planned", desc: "Did last cycle’s changes work?" },
];

export function Competitors() {
  return (
    <section id="competitors" className="bg-surface">
      <Container className="flex flex-col gap-14 py-20 lg:py-28">
        <div className="flex max-w-[1030px] flex-col gap-5">
          <Kicker>The competitors</Kicker>
          <SectionHeading>Each AI reflection tool has their limitations</SectionHeading>
        </div>

        <div className="flex flex-col gap-16 lg:flex-row">
          <table className="w-full self-start text-left">
            <thead>
              <tr className="border-b border-rule">
                <th
                  colSpan={2}
                  className="pb-3.5 font-mono text-xs leading-normal font-normal tracking-[1px] text-text-3"
                >
                  TOOLS HELP WITH
                </th>
              </tr>
            </thead>
            <tbody>
              {tools.map((t) => (
                <tr key={t.name} className="border-b border-rule">
                  <th
                    scope="row"
                    className="w-[140px] py-4 pr-6 align-top font-body text-[15px] leading-normal font-semibold text-ink sm:w-[224px]"
                  >
                    {t.name}
                  </th>
                  <td className="py-4 font-body text-[15px] leading-normal text-text-2">{t.helpsWith}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex w-full flex-col gap-6 border-t-2 border-accent bg-paper px-7 pt-6 pb-7 lg:w-[460px] lg:shrink-0">
            <p className="font-mono text-xs leading-normal tracking-[1px] text-accent">SECOND LOOK ADDS</p>
            <ol className="flex flex-col gap-6">
              {additions.map((a, i) => (
                <li key={a.title} className="flex gap-4">
                  <span className="font-mono text-[13px] leading-normal text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display text-xl leading-[1.25] font-bold tracking-[-0.4px] text-ink">
                      {a.title}
                    </h3>
                    <p className="font-body text-sm leading-normal text-text-2">{a.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}
