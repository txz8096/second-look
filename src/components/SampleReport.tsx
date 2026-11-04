import { ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";
import { SPARKLINES } from "@/lib/paths";
import { Sparkline } from "./Sparkline";
import { Term } from "./Term";
import { Container, Kicker, Pill } from "./ui";

// A condensed copy of plugins/second-look/skills/second-look/report-template.html. Its copy and numbers come from there.
type Confidence = "Sure" | "Likely" | "Hunch";

const patterns: { title: string; next: string; tools: string; confidence: Confidence; expanded?: boolean }[] = [
  {
    title: "You retype the same rules across your tools",
    next: "Try this: Add your rules to the tools missing them",
    tools: "Claude Code · Codex · Cursor · claude.ai · ChatGPT",
    confidence: "Sure",
  },
  {
    title: "Prototype sessions start vague, then restart",
    next: "Try this: Brief before big prototype tasks",
    tools: "Claude Code · Codex · Cursor · claude.ai",
    confidence: "Likely",
    expanded: true,
  },
  {
    title: "Prototypes often go out without a last check",
    next: "Try this: Check beta work before it ships",
    tools: "Claude Code · Codex · claude.ai",
    confidence: "Hunch",
  },
  {
    title: "Long sessions drift across projects and eat your usage",
    next: "Try this: Start fresh between projects",
    tools: "Claude Code · Codex",
    confidence: "Likely",
  },
  {
    title: "Your strongest model does your simplest work",
    next: "Try this: Match the model to the job",
    tools: "Claude Code",
    confidence: "Likely",
  },
];

const lastReview: { verdict: "Keep" | "Revise"; fix: string; result: string }[] = [
  {
    verdict: "Keep",
    fix: "Confirm the plan before editing.",
    result: "You’re correcting the AI about as often as before, at 1.2 per 10 messages. The fix is only 2 weeks old, too soon to tell.",
  },
  {
    verdict: "Keep",
    fix: "Send research comparisons to a helper agent.",
    result: "Sessions using one rose from 11% to 18%, but sessions crowded with lookups stayed about the same.",
  },
  {
    verdict: "Revise",
    fix: "Brief before big prototype tasks.",
    result: "You haven’t tried this yet, so it’s smaller now: only longer prototype sessions. It’s fix 2 in your plan.",
  },
];

const plan: { fix: string; time: string; saves: string }[] = [
  { fix: "Add your rules to the tools missing them", time: "5 minutes, once", saves: "About 5 minutes a week" },
  {
    fix: "Brief before big prototype tasks",
    time: "A minute before any prototype that’s more than a quick tweak",
    saves: "About 30 minutes a week",
  },
  { fix: "Check beta work before it ships", time: "5 minutes per piece others will see", saves: "Fewer fixes after launch" },
  {
    fix: "Start fresh between projects",
    time: "A habit, whenever you switch projects",
    saves: "About a tenth of your Claude Code and Codex usage",
  },
  { fix: "Match the model to the job", time: "A few seconds per session", saves: "About a tenth of your Claude Code usage" },
];

const trends = [
  {
    label: "Briefed starts",
    value: "52%",
    delta: "About the same",
    d: SPARKLINES.briefedStarts,
    explanation: "Share of sessions where your first message gives the goal, the context and what done looks like.",
  },
  {
    label: "Corrections / 10 msgs",
    value: "1.2",
    delta: "About the same",
    d: SPARKLINES.corrections,
    explanation: "How often you redirect or fix the AI, per 10 messages. Lower means it understood you sooner.",
  },
  {
    label: "Output checking",
    value: "34%",
    delta: "−11 pts",
    d: SPARKLINES.outputChecking,
    explanation: "Share of sessions where you test, review or question the output before accepting it.",
  },
  {
    label: "Restarts",
    value: "15%",
    delta: "+9 pts",
    d: SPARKLINES.restarts,
    explanation: "Sessions that start over on a task you began in the last 2 days.",
  },
] as const;

const fixFirst: { issue: string; fix: string }[] = [
  { issue: "pr-review names a tool that doesn’t exist, so the visual check can get skipped", fix: "Paste the fix (5 min)" },
  { issue: "release-notes still lists last quarter’s pricing tiers", fix: "Paste the fix (5 min)" },
  {
    issue: "beta-feedback-synth says the team has 4 engineers; your notes say 6",
    fix: "In claude.ai, paste: “Change the team size in my beta-feedback-synth skill from 4 to 6.” (1 min)",
  },
];

const confidenceVariant = {
  Sure: "tint",
  Likely: "neutral",
  Hunch: "outline",
} as const;

function Rank({ n }: { n: number }) {
  return (
    <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-accent-tint font-body text-[13px] font-bold text-accent">
      {n}
    </span>
  );
}

function PartTitle({ children }: { children: ReactNode }) {
  return <h3 className="font-display text-xl font-bold tracking-[-0.4px] text-ink">{children}</h3>;
}

function SubTitle({ children }: { children: ReactNode }) {
  return <h4 className="pt-3 font-display text-lg font-bold text-ink">{children}</h4>;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="font-body text-xs font-semibold tracking-[0.8px] text-text-3">{children}</p>;
}

function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={`py-2.5 pr-4 text-left align-top font-body text-xs font-semibold tracking-[0.6px] text-text-3 last:pr-0 ${className}`}
    >
      {children}
    </th>
  );
}

// Below md each row stacks into a block, and the label stands in for the hidden column header.
function Td({ label, children, className = "" }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <td className={`py-3 pr-4 align-top last:pr-0 max-md:flex max-md:flex-col max-md:gap-1 max-md:p-0 ${className}`}>
      {label && (
        <span className="font-body text-xs font-semibold tracking-[0.6px] text-text-3 md:hidden" aria-hidden="true">
          {label}
        </span>
      )}
      {children}
    </td>
  );
}

const stackedRow = "border-b border-rule max-md:flex max-md:flex-col max-md:gap-3 max-md:py-4";

function ExpandedPattern() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <FieldLabel>WHAT HAPPENS</FieldLabel>
        <p className="font-body text-[17px] leading-normal text-ink">
          Your first message names what to build, but not who it’s for or what done looks like. You fill in the gaps
          over the next few messages, and sometimes start a new session.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <FieldLabel>EVIDENCE</FieldLabel>
        <p className="font-body text-base leading-normal text-ink">
          In the last 4 weeks, 16 of your 25 <Term name="restarts">restarts</Term> were prototype sessions, including 4
          Streak settings-screen sessions on Oct 14–15. In those 4 weeks, 44% of prototype sessions opened with a brief.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <FieldLabel>WHY IT MATTERS</FieldLabel>
        <p className="font-body text-base leading-normal text-ink">
          Each restart repeats the setup, and without a definition of done it’s hard to tell when a prototype is
          finished.
        </p>
      </div>
      <div className="flex flex-col gap-3.5 rounded-2xl bg-accent-tint px-6 py-[22px]">
        <div className="flex flex-col gap-1">
          <p className="font-display text-[19px] font-bold tracking-[-0.5px] text-ink">
            Try this: Brief before big prototype tasks
          </p>
          <p className="font-body text-base font-semibold text-accent">Saves about 30 minutes a week</p>
        </div>
        <p className="font-body text-base leading-normal text-ink">
          Starting a prototype that’s more than a quick tweak? Open with the goal, the user, what done means and the
          limits. If you don’t know what done looks like yet, say so.
        </p>
      </div>
    </div>
  );
}

export function SampleReport() {
  return (
    <section id="sample-report" className="border-y border-rule bg-surface">
      <Container className="flex flex-col gap-14 py-20 lg:py-28">
        <Kicker as="h2">Sample report</Kicker>

        <article className="bg-paper outline outline-1 -outline-offset-1 outline-rule">
          {/* Summary */}
          <header className="flex flex-col gap-5 border-b border-rule px-5 pt-7 pb-8 md:px-10">
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-body text-sm text-text-2">{"Oct\u00a025,\u00a02026"}</p>
              <Pill variant="neutral">Sample data</Pill>
            </div>
            <p className="font-body text-lg leading-normal text-ink">
              Over the past year, you’ve gotten better at explaining what you want, and the AI misreads you less. Lately
              the Streak redesign pulled the other way: you’ve been checking prototypes less and starting over more often.
            </p>
          </header>

          {/* Prompts and setup */}
          <section className="flex flex-col gap-4 px-5 pt-8 pb-9 md:px-10">
            <PartTitle>Improve your prompts and setup</PartTitle>
            <p className="font-body text-[15px] leading-normal text-text-2">
              Vague prototype starts take the most time. Syncing your rules is the quickest fix, so it comes first. Five
              fixes below, all in your plan until Nov 8.
            </p>

            <SubTitle>Did the fixes from your last review work?</SubTitle>
            <ul className="flex flex-col gap-3 pb-4">
              {lastReview.map((r) => (
                <li key={r.fix} className="flex items-start gap-3">
                  <span className="w-16 shrink-0">
                    <Pill variant={r.verdict === "Keep" ? "tint" : "outline"}>{r.verdict}</Pill>
                  </span>
                  <p className="font-body text-[15px] leading-normal text-text-2">
                    <span className="font-medium text-ink">{r.fix}</span> {r.result}
                  </p>
                </li>
              ))}
            </ul>

            <ol className="flex flex-col gap-4">
              {patterns.map((p, i) => (
                <li
                  key={p.title}
                  className={`flex flex-col gap-5 border-b border-rule last:border-b-0 md:px-7 ${p.expanded ? "pb-7" : "pb-[18px]"}`}
                >
                  <div className="flex items-start gap-3.5 sm:items-center">
                    <Rank n={i + 1} />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <h4 className="font-display text-[19px] font-bold tracking-[-0.3px] text-ink">{p.title}</h4>
                      {!p.expanded && <p className="font-body text-sm text-text-3">{p.next}</p>}
                    </div>
                    <span className="hidden font-body text-[13px] text-text-3 lg:inline">{p.tools}</span>
                    <span className="hidden sm:inline-flex">
                      <Pill variant={confidenceVariant[p.confidence]}>{p.confidence}</Pill>
                    </span>
                    {p.expanded ? (
                      <ChevronUp size={20} className="shrink-0 text-text-2" aria-hidden="true" />
                    ) : (
                      <ChevronDown size={20} className="shrink-0 text-text-2" aria-hidden="true" />
                    )}
                  </div>
                  {p.expanded && <ExpandedPattern />}
                </li>
              ))}
            </ol>

            <SubTitle>Your plan until Nov 8</SubTitle>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="max-md:sr-only">
                  <tr className="border-b border-rule">
                    <Th>FIX</Th>
                    <Th>TIME</Th>
                    <Th>SAVES</Th>
                  </tr>
                </thead>
                <tbody>
                  {plan.map((row) => (
                    <tr key={row.fix} className={stackedRow}>
                      <Td className="font-body text-[15px] leading-normal font-medium text-ink">{row.fix}</Td>
                      <Td label="TIME" className="font-body text-sm leading-normal text-text-2">
                        {row.time}
                      </Td>
                      <Td label="SAVES" className="font-body text-sm leading-normal text-text-2">
                        {row.saves}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Skills */}
          <section className="flex flex-col gap-4 border-t border-rule px-5 pt-8 pb-9 md:px-10">
            <PartTitle>Keep your skills current</PartTitle>
            <p className="font-body text-[15px] leading-normal text-text-2">
              Three of your seven skills give wrong information today.
            </p>
            <p className="font-body text-[13px] text-text-3">
              Checked Oct 25: 7 skills you wrote, 17 you installed. Couldn’t read your Cursor skills folder, so any skills
              there aren’t counted.
            </p>
            <SubTitle>Skills to fix</SubTitle>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="max-md:sr-only">
                  <tr className="border-b border-rule">
                    <Th>ISSUE</Th>
                    <Th>FIX</Th>
                  </tr>
                </thead>
                <tbody>
                  {fixFirst.map((row) => (
                    <tr key={row.issue} className={stackedRow}>
                      <Td className="font-body text-[15px] leading-normal font-medium text-ink">{row.issue}</Td>
                      <Td label="FIX" className="font-body text-sm leading-normal text-text-2">
                        {row.fix}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Habits, last */}
          <section className="flex flex-col gap-4 border-t border-rule px-5 pt-8 pb-10 md:px-10">
            <PartTitle>How your habits are changing</PartTitle>
            <p className="font-body text-[15px] leading-normal text-text-2">
              A full year of claude.ai; Claude Code since Jun 29; Codex since Apr 20; Cursor since Feb 9; a full year of
              ChatGPT. Gemini isn’t added.
            </p>
            <p className="font-body text-[15px] leading-normal text-text-2">
              Last 4 weeks compared with the 4 before: you restarted more tasks and checked the work less often.
            </p>
            <div className="grid grid-cols-1 gap-8 pt-2 sm:grid-cols-2 lg:grid-cols-4">
              {trends.map((t) => (
                <div key={t.label} className="flex flex-col gap-2.5 pt-4">
                  <p className="font-mono text-xs text-text-3">{t.label}</p>
                  <p className="flex items-end gap-1.5">
                    <span className="font-display text-[22px] leading-none font-medium text-ink">{t.value}</span>
                    <span className="font-mono text-xs text-text-2">{t.delta}</span>
                  </p>
                  <div className="flex flex-col gap-1 pt-1.5">
                    <Sparkline d={t.d} className="h-12" />
                    <div className="flex justify-between font-mono text-xs text-text-3">
                      <span>Nov</span>
                      <span>Oct</span>
                    </div>
                  </div>
                  <p className="font-body text-xs leading-[1.45] text-text-2">{t.explanation}</p>
                </div>
              ))}
            </div>
          </section>

        </article>
      </Container>
    </section>
  );
}
