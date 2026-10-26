import { links } from "@/lib/site";
import { ArrowRight } from "lucide-react";
import { Fragment } from "react";
import { Container, Kicker, SectionHeading } from "./ui";

const flow = [
  {
    title: "Your files",
    desc: "~/.claude, ~/.codex, Cursor’s database, and the exports you add. Read only when you ask for a review.",
  },
  {
    title: "Your assistant",
    desc: "Claude Code, Codex or Cursor runs the review on your computer and writes the report to ~/.second-look.",
  },
  {
    title: "Your model provider",
    desc: "Sees what the review reads, like any message you send your assistant, under your existing account settings.",
  },
];

const answers = [
  {
    title: "What it reads",
    desc: "Claude Code, Codex and Cursor logs on this computer, the exports you add, and your skill files. Run install.sh --check to see the list for your machine.",
  },
  {
    title: "What gets removed",
    desc: "API keys, emails, and token or password values are stripped before anything is quoted. It works by pattern, so read a report before you share it.",
  },
  {
    title: "Who sees the report",
    desc: "Only you. It’s saved in ~/.second-look or published as a private artifact, and it’s shared only if you choose to.",
  },
  {
    title: "What you can leave out",
    desc: "Scope any review to a window, a tool or a project: “only my Cursor sessions”, “since Oct 1”.",
  },
  {
    title: "Check it yourself",
    desc: "The skill is open source. Its two scripts use Python’s standard library and make no network calls.",
  },
  {
    title: "Delete it any time",
    desc: "Stop recurring reviews, then remove ~/.second-look and the skill folder. If you kept a year of Claude Code history, set it back to 30 days in one setting.",
  },
];

export function Privacy() {
  return (
    <section id="privacy" className="border-t border-rule bg-paper">
      <Container className="flex flex-col gap-14 py-20 lg:py-28">
        <div className="flex max-w-[760px] flex-col gap-5">
          <Kicker>Privacy</Kicker>
          <SectionHeading>What it reads, and where it goes.</SectionHeading>
          <p className="font-body text-[17px] leading-[1.55] text-text-2">
            second look has no server and no account. Nothing about your sessions is sent to us.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <ol className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:gap-4">
            {flow.map((step, i) => (
              <Fragment key={step.title}>
                <li className="flex flex-1 flex-col gap-2.5 rounded-[10px] bg-surface p-[22px] outline outline-1 -outline-offset-1 outline-rule">
                  <span className="font-mono text-xs tracking-[0.8px] text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-xl font-bold tracking-[-0.4px] text-ink">{step.title}</h3>
                  <p className="font-body text-sm leading-normal text-text-2">{step.desc}</p>
                </li>
                {i < flow.length - 1 && (
                  <ArrowRight
                    size={20}
                    className="shrink-0 rotate-90 self-center text-text-3 lg:rotate-0"
                    aria-hidden="true"
                  />
                )}
              </Fragment>
            ))}
          </ol>
        </div>

        <ul className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {answers.map((a) => (
            <li key={a.title} className="flex flex-col gap-3 border-t-2 border-accent pt-[22px]">
              <h3 className="font-display text-[22px] leading-[1.2] font-bold tracking-[-0.5px] text-ink">{a.title}</h3>
              <p className="font-body text-[15px] leading-[1.55] text-text-2">{a.desc}</p>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <p className="flex-1 font-body text-sm leading-[1.55] text-text-3">
            Using AI tools at work? Check your company’s AI policy before you review work sessions. Keeping a year of
            history also means more of it stays on your disk; the installer asks before changing that.
          </p>
          <a
            href={`${links.github}#privacy`}
            className="shrink-0 font-body text-sm text-accent underline-offset-4 hover:underline"
          >
            Privacy details on GitHub →
          </a>
        </div>
      </Container>
    </section>
  );
}
