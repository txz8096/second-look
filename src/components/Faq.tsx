import { Minus, Plus } from "lucide-react";
import { Container, Kicker } from "./ui";

const faqs = [
  {
    q: "Do I need to install it in every tool?",
    a: "No. The installer puts one copy on your computer and links it into Claude Code, Codex and Cursor, whichever you have. A review runs in the tool where you start it, and it reads every tool’s files from there.",
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
    a: "Download second-look.zip from the latest GitHub release, turn on code execution, chat search and memory in Settings, and upload the zip under Skills. Without chat search or a conversations.json export, habit numbers show as “Not measured” instead of a guess.",
  },
  {
    q: "What happens the first time I run it?",
    a: "It asks four short questions: what you build, which areas to watch for new releases, where your standing rules live, and where your skills are. Your answers become a profile in ~/.second-look/profile.md that you can edit later.",
  },
  {
    q: "How often should I run it?",
    a: "Every two weeks works well. Each review checks last cycle’s experiments, then suggests up to three new ones. You can also run it any time for a window you name, like “since Oct 1” or “my Cursor sessions”, without moving your reminder.",
  },
  {
    q: "Does it run by itself? Can I change or stop the reminder?",
    a: "Only if you use the Claude desktop app. There, second look can set up a scheduled task that runs the full review on your Mac every two weeks, as a session you open afterwards. It uses your quota each time and runs while the app is open. Everywhere else it never runs a review by itself: if you turn on the reminder at install, a small daily job on your computer shows a notification when a review is due, then again every two days until you run one. Ask your assistant to change the interval (“remind me monthly”) or turn it off (“stop the reminders”). The reminder needs your computer to be on, and works on macOS and Linux.",
  },
  {
    q: "How far back does the yearly view go?",
    a: "As far as your logs do. Claude Code keeps 30 days by default, which is why the installer offers to keep a year. claude.ai and ChatGPT count up to the day you export. Each run saves weekly totals, so weeks your tools later delete stay in the trend. The sample report on this page uses made-up data.",
  },
  {
    q: "How accurate are the findings?",
    a: "They’re estimates read from the wording of your sessions. Each finding shows its examples and how sure the review is (Clear pattern, Likely pattern or Unconfirmed). Before trusting a number, the review spot-checks a sample of its own labels, and you can correct a label at the next review.",
  },
  {
    q: "Where does it run, and is anything uploaded?",
    a: "On your machine, and the report is saved in ~/.second-look. Nothing goes to Second Look, because there’s no Second Look server. The review runs inside your assistant, so what it reads goes to your model provider like any other message you send, under your existing account settings.",
  },
  {
    q: "What is redacted?",
    a: "Prompts are trimmed, and API keys, emails, and token or password values are removed before anything is quoted. This works by pattern, so it can miss things like a client’s name. Read a report before you share it.",
  },
  {
    q: "Can I edit or delete the report?",
    a: "Yes. The report, your profile, the review log and your history are plain files in ~/.second-look on your computer. Edit or delete them whenever you like.",
  },
  {
    q: "How do I uninstall it?",
    a: "Ask your assistant to stop the reminders, if you set one. Then delete ~/.agents/skills/second-look and the second-look links in ~/.claude/skills, ~/.codex/skills and ~/.cursor/skills. Delete ~/.second-look too if you don’t want to keep your reports. If you used the plugin, run /plugin uninstall second-look.",
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
