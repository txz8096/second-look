import { Container, Kicker } from "./ui";

const faqs = [
  {
    q: "What data does it read?",
    a: "Only what you point it at: local Claude Code, Codex and Cursor logs, claude.ai and ChatGPT exports, and your skill and config files.",
  },
  {
    q: "Do I need to install it in every tool?",
    a: "No. Install it once, say in Claude Code, and it still reads your Codex and Cursor sessions on the same computer, because it opens each tool’s log files directly. Install it in another tool only if you want to start reviews from there.",
  },
  {
    q: "Does running it in one tool start it in the others?",
    a: "No. Nothing runs in the background or between tools. A review runs only where you start it, or when a schedule you set up fires. That one run reads every tool’s files, and every run on your computer shares the same notes in ~/.second-look.",
  },
  {
    q: "Does one report cover all my AI tools?",
    a: "Yes, when you run it on your computer: Claude Code, Codex and Cursor, plus claude.ai and ChatGPT if you add their data exports. Run from claude.ai, it only sees your claude.ai chats.",
  },
  {
    q: "How far back does the yearly view go?",
    a: "As far back as your logs do. Claude Code keeps 30 days by default; installing with --keep-history keeps a year from then on. Codex and Cursor go back as far as their files. claude.ai and ChatGPT count up to the day you exported. The sample report on this page uses made-up data.",
  },
  {
    q: "Are cloud sessions included?",
    a: "No. Claude Code on the web, Codex cloud tasks and Cursor cloud agents don’t leave logs on your computer, so second look can’t see them.",
  },
  {
    q: "How often should I run it?",
    a: "Every two weeks. Each review checks last cycle’s experiments, then suggests up to three new ones.",
  },
  {
    q: "How accurate are the findings?",
    a: "They’re estimates. Each shows its examples and confidence, and you can correct any label.",
  },
  { q: "Where does analysis run?", a: "On your machine. The report is saved next to your files." },
  {
    q: "Is anything uploaded?",
    a: "No. There’s no Second Look server. Your agent talks to its model provider as usual, under your account settings.",
  },
  {
    q: "What is redacted or excluded?",
    a: "Secrets are removed and prompts trimmed before anything is quoted.",
  },
  {
    q: "Can I edit or delete the report?",
    a: "Every finding links to its examples. The report is a local file you can edit or delete.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-4 bg-dark">
      <Container className="flex flex-col gap-16 py-20 lg:py-28">
        <Kicker>FAQ</Kicker>
        <dl className="border-t border-rule">
          {faqs.map((item) => (
            <div key={item.q} className="flex flex-col gap-3 border-b border-rule py-6 md:flex-row md:gap-12">
              <dt className="font-display text-[22px] leading-[1.3] font-bold tracking-[-0.6px] text-ink md:w-[560px] md:shrink-0 md:text-2xl">
                {item.q}
              </dt>
              <dd className="pt-1 font-body text-base leading-[1.55] text-dark-text-2">{item.a}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
