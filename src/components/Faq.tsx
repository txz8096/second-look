import { ArrowUpRight, Minus, Plus } from "lucide-react";
import { links } from "@/lib/site";
import { Container, SectionHeading } from "./ui";

const faqs = [
  {
    q: "Which AI apps does it support?",
    a: "Claude Code, Codex, Cursor and Antigravity are read directly. You can also add exports from claude.ai, ChatGPT and Gemini. Start a review from Claude Code, Codex or Cursor on the computer where your sessions are saved.",
  },
  {
    q: "What does it read?",
    a: "Local session logs, the data exports you add, and your skill and config files. Cloud sessions aren’t included. The review runs inside your assistant, so your model provider sees what it reads under your existing account settings.",
  },
  {
    q: "Does it run automatically?",
    a: "Only if you opt in after your first report. Claude and Codex desktop apps, and terminal setups, can run scheduled reviews on your computer. Cursor and Antigravity use reminders instead. Each run uses your quota and needs your computer on. Ask your assistant to change the cadence or stop reviews any time.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-rule bg-paper">
      <Container className="flex flex-col gap-8 py-16">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <SectionHeading size="compact">A few practical questions</SectionHeading>
          <a href={`${links.github}#faq`} className="inline-flex min-h-11 items-center gap-2 font-body text-base text-accent underline-offset-4 hover:underline">
            More on GitHub <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
        <div>
          {faqs.map((item) => (
            <details key={item.q} className="group border-b border-rule py-6 last:border-b-0">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-8 [&::-webkit-details-marker]:hidden">
                <h3 className="flex-1 font-display text-[22px] leading-[1.3] font-semibold text-ink">{item.q}</h3>
                <Plus size={22} className="shrink-0 text-accent group-open:hidden" aria-hidden="true" />
                <Minus size={22} className="hidden shrink-0 text-accent group-open:block" aria-hidden="true" />
              </summary>
              <p className="pt-3.5 pb-1 font-body text-base leading-[1.55] text-dark-text-2">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
