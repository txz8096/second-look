import { Minus, Plus } from "lucide-react";
import { Container, Kicker } from "./ui";

const faqs = [
  {
    q: "Do I need to install it in every tool?",
    a: "No. Install it once and it reads Codex and Cursor logs on the same computer too. A review runs only in the tool where you start it, but it reads every tool’s files.",
  },
  {
    q: "Does one report cover all my AI tools?",
    a: "Yes, if you start it from Claude Code (terminal or desktop app), Codex or Cursor on the computer where you use them. One run reads all three tools’ logs, plus claude.ai and ChatGPT if you add their data exports. Started from claude.ai in a browser or from a cloud session, it can’t see those logs, so it covers only your claude.ai chats.",
  },
  {
    q: "What data does it read?",
    a: "Only what you point it at: local Claude Code, Codex and Cursor logs, the claude.ai and ChatGPT data exports you download yourself, and your skill and config files for the upkeep check. Cloud sessions aren’t included.",
  },
  {
    q: "What do I need to run it on claude.ai?",
    a: "Turn on chat search, code execution and memory in Settings, and upload the whole skill folder as a zip. Without chat search or a conversations.json export, habit numbers show as “Not measured” instead of a guess.",
  },
  {
    q: "What happens the first time I run it?",
    a: "It asks four short questions: what you build, which areas to watch for new releases, where your standing rules live, and where your skills are. Your answers become a profile you can edit later.",
  },
  {
    q: "How often should I run it?",
    a: "Every two weeks. Each review checks last cycle’s experiments, then suggests up to three new ones. You can also run it any time for a window you name, like “since Oct 1” or “my Cursor sessions”, without moving the schedule.",
  },
  {
    q: "How far back does the yearly view go?",
    a: "As far as your logs do. Claude Code keeps 30 days by default; claude.ai and ChatGPT count up to the day you export. Each run saves weekly totals, so weeks your tools later delete stay in the trend. The sample report on this page uses made-up data.",
  },
  {
    q: "How accurate are the findings?",
    a: "They’re estimates read from the wording of your sessions. Each finding shows its examples and how sure the review is.",
  },
  {
    q: "Where does it run, and is anything uploaded?",
    a: "On your machine, and the report is saved next to your files. Nothing goes to Second Look, because there’s no Second Look server. Your agent talks to its model provider as usual, under your account settings.",
  },
  {
    q: "What is redacted?",
    a: "Secrets are removed and prompts trimmed before anything is quoted. Keys, emails and other people’s private details never appear in the report.",
  },
  {
    q: "Can I correct, edit or delete the report?",
    a: "Every finding links to its examples, and you can relabel any of them. The report, your profile and history are files in ~/.second-look on your computer, so you can edit or delete them.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-dark">
      <Container className="flex flex-col gap-16 py-20 lg:py-28">
        <Kicker>FAQ</Kicker>
        <div className="border-t border-rule">
          {faqs.map((item, i) => (
            <details key={item.q} open={i === 0} className="group border-b border-rule py-[22px]">
              <summary className="flex cursor-pointer list-none items-center gap-8 [&::-webkit-details-marker]:hidden">
                <h3 className="flex-1 font-display text-[22px] leading-[1.3] font-bold tracking-[-0.5px] text-ink">
                  {item.q}
                </h3>
                <Plus size={22} className="shrink-0 text-accent group-open:hidden" aria-hidden="true" />
                <Minus size={22} className="hidden shrink-0 text-accent group-open:block" aria-hidden="true" />
              </summary>
              <p className="max-w-[760px] pt-3.5 pb-1 font-body text-base leading-[1.55] text-dark-text-2">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
