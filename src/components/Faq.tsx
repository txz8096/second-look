import { Minus, Plus } from "lucide-react";
import { Container, Kicker } from "./ui";

type Faq = { q: string; a: string; table?: { head: string[]; rows: string[][] } };

const faqs: Faq[] = [
  {
    q: "Do I need to install it in every tool?",
    a: "No. The installer puts one copy on your computer and links it into Claude Code, Codex and Cursor, whichever you have. A review runs in the tool where you start it, and it reads every tool’s files from there.",
  },
  {
    q: "Which AI apps does it support?",
    a: "Seven. Claude Code, Codex and Cursor can run a review and are read directly. Antigravity is read directly but can’t start a review, so start one from another tool on the same computer. claude.ai, ChatGPT and Gemini (the web app) are read from data exports you download, so they count up to the day you export. Gemini’s export has no conversation boundaries, so its sessions are grouped by time and its numbers are estimates. Antigravity support is new and built on an undocumented file format, so a release that changes it can hide your sessions until second look is updated.",
  },
  {
    q: "Does one report cover all my AI tools?",
    a: "Yes, if you start it from Claude Code (terminal or desktop app), Codex or Cursor on the computer where you use them. One run reads their logs and Antigravity’s, plus claude.ai, ChatGPT and Gemini if you add their data exports. Started from claude.ai in a browser or from a cloud session, it can’t see those logs, so it covers only your claude.ai chats.",
  },
  {
    q: "What data does it read?",
    a: "Only what you point it at: local Claude Code, Codex, Cursor and Antigravity logs, the claude.ai, ChatGPT and Gemini data exports you download yourself, and your skill and config files for the upkeep check. Cloud sessions aren’t included.",
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
    a: "Every two weeks works well. Each review checks last cycle’s experiments, then suggests up to three new ones. You can also ask for a review any time; it covers everything since the last one. Name a narrower scope, like “my Cursor sessions”, if that’s all you want.",
  },
  {
    q: "Does it run by itself? Can I change or stop it?",
    a: "Yes, if you say yes after your first report. In the Claude desktop app or the Codex app, a scheduled task runs the full review on your computer. In a terminal, a small daily job runs it in the background and tells you when the report is ready. In Cursor or Antigravity, which can’t schedule anything on your computer, you get a notification when a review is due instead. Every scheduled review includes Antigravity sessions and your exports, and the notification tells you when an export is over 90 days old. Each run uses your quota and needs your computer on. Ask your assistant to change the cadence (“make it monthly”) or stop it (“stop the reviews”).",
  },
  {
    q: "Which apps can run it on a schedule?",
    a: "It depends on whether the app can run the review on your computer, because that’s where your session logs are.",
    table: {
      head: ["Where you use it", "Runs by itself?", "How it recurs", "Needs"],
      rows: [
        ["Claude desktop app", "Yes", "A scheduled task in the app runs the full review", "The app open, computer on"],
        ["Codex app", "Yes", "A scheduled task in the app runs the full review", "The app open, computer on"],
        [
          "Terminal (Claude Code or Codex CLI)",
          "Yes",
          "A daily job runs the review in the background, then tells you the report is ready",
          "Computer on; file access approved in advance",
        ],
        ["Cursor", "No", "A notification when a review is due; you start it", "Computer on (macOS or Linux)"],
        [
          "Antigravity",
          "No",
          "A notification when a review is due; start it from Claude Code, Codex or Cursor. Any scheduled review includes your Antigravity sessions",
          "Computer on, and one of those tools installed",
        ],
        ["claude.ai", "Yes, claude.ai only", "A claude.ai scheduled task. It can’t see your coding tools", "Chat search on"],
        ["ChatGPT", "No", "Reviews don’t run here. Its history comes in through the data export", "A conversations.json export"],
        [
          "Gemini (web app)",
          "No",
          "Reviews don’t run here. Its history comes in through the Takeout export, and you’re reminded when it’s 90 days old",
          "A MyActivity.json export",
        ],
      ],
    },
  },
  {
    q: "How far back does the yearly view go?",
    a: "As far as your logs do. Claude Code keeps 30 days by default, which is why the installer offers to keep a year. claude.ai, ChatGPT and Gemini count up to the day you export. Each run saves weekly totals, so weeks your tools later delete stay in the trend. The sample report on this page uses made-up data.",
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
    a: "Ask your assistant to stop the reviews, if you set them up. Then delete ~/.agents/skills/second-look and the second-look links in ~/.claude/skills, ~/.codex/skills and ~/.cursor/skills. Delete ~/.second-look too if you don’t want to keep your reports. If you used the plugin, run /plugin uninstall second-look.",
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
              <p className="fade-down max-w-[760px] pt-3.5 pb-1 font-body text-base leading-[1.55] text-dark-text-2">{item.a}</p>
              {item.table && (
                <div className="fade-down mt-4 overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left font-body text-sm leading-[1.5]">
                    <thead>
                      <tr className="border-b border-rule">
                        {item.table.head.map((h) => (
                          <th key={h} className="py-2.5 pr-6 font-mono text-xs font-normal tracking-[0.8px] text-accent uppercase">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {item.table.rows.map((row) => (
                        <tr key={row[0]} className="border-b border-rule last:border-b-0">
                          {row.map((cell, j) => (
                            <td key={j} className={`py-3 pr-6 align-top ${j === 0 ? "text-ink" : "text-dark-text-2"}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
