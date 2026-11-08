import { ArrowUpRight } from "lucide-react";
import { links } from "@/lib/site";
import { Container, SectionHeading } from "./ui";

const groups = [
  {
    label: "Read directly",
    apps: "Claude Code, Codex, Cursor, Antigravity",
    note: "Antigravity support is new; some app chats may be missing.",
  },
  {
    label: "Add an export",
    apps: "claude.ai, ChatGPT, Gemini",
    note: "Optional. Includes history up to your export date.",
  },
];

export function Coverage() {
  return (
    <section id="coverage" className="border-t border-rule bg-paper">
      <Container className="flex flex-col gap-8 py-16">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <SectionHeading size="compact">Coverage across your AI apps</SectionHeading>
          <a href={`${links.github}#supported-apps`} className="inline-flex min-h-11 items-center gap-2 font-body text-base text-accent underline-offset-4 hover:underline">
            Coverage details on GitHub <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
        <dl>
          {groups.map((group) => (
            <div key={group.label} className="grid gap-3 border-b border-rule py-5 last:border-b-0 md:grid-cols-[240px_1fr] md:gap-8">
              <dt className="font-body text-lg font-medium text-accent">{group.label}</dt>
              <dd className="flex flex-col gap-2">
                <p className="font-body text-[22px] leading-[1.3] font-medium text-ink">{group.apps}</p>
                <p className="font-body text-base leading-normal text-text-2">{group.note}</p>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
