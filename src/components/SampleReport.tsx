import { ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";
import { SPARKLINES } from "@/lib/paths";
import { Sparkline } from "./Sparkline";
import { Term } from "./Term";
import { Container, Kicker, Pill } from "./ui";

const glance: { label: string; term?: "corrections"; value: string; delta: string; note: string }[] = [
  { label: "Sessions", value: "94", delta: "+6", note: "Shown for context." },
  { label: "Briefed starts", value: "54%", delta: "+6 pts", note: "Opens with goal, context and done." },
  { label: "Corrections", term: "corrections", value: "1.1", delta: "−0.3", note: "Per 10 messages." },
  { label: "Restarts", value: "11", delta: "+5", note: "Starting a task over." },
  { label: "Rules retyped", value: "17", delta: "+3", note: "Rules that belong in a config file." },
];

type Confidence = "Clear pattern" | "Likely pattern" | "Unconfirmed";

const patterns: { title: string; next: string; tools: string; confidence: Confidence; expanded?: boolean }[] = [
  {
    title: "You retype the same rules in every tool",
    next: "Try this: sync your standing rules to every tool",
    tools: "Claude Code · Codex · Cursor",
    confidence: "Clear pattern",
  },
  {
    title: "Prototype chats start vague, then restart",
    next: "Try this: brief before big prototype tasks",
    tools: "Claude Code · Cursor · claude.ai",
    confidence: "Likely pattern",
    expanded: true,
  },
  {
    title: "Finished-looking prototypes get waved through",
    next: "Try this: check portfolio work before it ships",
    tools: "Claude Code · claude.ai",
    confidence: "Unconfirmed",
  },
  {
    title: "Long Claude Code sessions drift between projects",
    next: "Not this cycle: clear context between projects",
    tools: "Claude Code",
    confidence: "Likely pattern",
  },
];

const trends = [
  {
    label: "Briefed starts",
    value: "56%",
    delta: "+39 pts",
    tone: "accent",
    d: SPARKLINES.briefedStarts,
    explanation: "Share of sessions where your first message gives the goal, the context and what done looks like.",
  },
  {
    label: "Corrections / 10 msgs",
    value: "1.1",
    delta: "−0.8",
    tone: "muted",
    d: SPARKLINES.corrections,
    explanation: "How often you redirect or fix the AI, per 10 messages. Lower means it understood you sooner.",
  },
  {
    label: "Output checking",
    value: "29%",
    delta: "−1 pt",
    tone: "accent",
    d: SPARKLINES.outputChecking,
    explanation: "Share of sessions where you test, review or question the output before accepting it.",
  },
  {
    label: "Restarts",
    value: "10%",
    delta: "+3 pts",
    tone: "muted",
    d: SPARKLINES.restarts,
    explanation: "Share of tasks you abandoned and started over in a fresh session.",
  },
] as const;

type Cell = { main: string; sub?: string; strong?: boolean };

const fixFirst: { issue: string; impact: Cell; sure: string; fix: string }[] = [
  {
    issue: "product-excellence points to tools that don’t exist",
    impact: { main: "High", sub: "Blocks the portfolio check" },
    sure: "Confirmed",
    fix: "5 min",
  },
  {
    issue: "case-study is installed twice; the claude.ai copy is older",
    impact: { main: "Medium", sub: "Two versions give different advice" },
    sure: "Confirmed",
    fix: "Replace the old copy",
  },
];

const experiments: { name: string; tried: Cell; habit: Cell; work: Cell; costs: Cell; decision: Cell }[] = [
  {
    name: "Add “ask clarifying questions first” to CLAUDE.md",
    tried: { main: "Yes" },
    habit: { main: "Corrections fell from 24 to 19", sub: "Cause unclear" },
    work: { main: "Not measured" },
    costs: { main: "Maybe slower simple tasks. Unchecked." },
    decision: { main: "Keep", sub: "Rate the results next time", strong: true },
  },
  {
    name: "Write a one-page prototype brief template",
    tried: { main: "No" },
    habit: { main: "—" },
    work: { main: "—" },
    costs: { main: "—" },
    decision: { main: "Revise", sub: "Replaced by this cycle’s brief habit", strong: true },
  },
];

const confidenceVariant = {
  "Clear pattern": "tint",
  "Likely pattern": "tint",
  Unconfirmed: "outline",
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

function CellText({ cell }: { cell: Cell }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`font-body text-sm leading-[1.45] ${cell.strong ? "font-medium text-ink" : "text-text-2"}`}>
        {cell.main}
      </span>
      {cell.sub && <span className="font-body text-[13px] leading-[1.45] text-text-3">{cell.sub}</span>}
    </div>
  );
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

function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`py-3 pr-4 align-top last:pr-0 ${className}`}>{children}</td>;
}

function ExpandedPattern() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <FieldLabel>WHAT HAPPENS</FieldLabel>
        <p className="font-body text-[17px] leading-normal text-ink">
          Your first message says what to build but skips who it’s for and what done means. The next turns
          fill the gaps, or you restart.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <FieldLabel>EVIDENCE</FieldLabel>
        <p className="font-body text-base leading-normal text-ink">
          Oct 12–25: 4 of 11 <Term name="restarts">restarts</Term> were prototypes, including 4 Gloss token-panel chats in 2 days. 35% of
          prototype sessions opened with a brief, vs 58% on claude.ai.
        </p>
      </div>
      <div className="flex flex-col gap-3.5 rounded-2xl bg-accent-tint px-6 py-[22px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="font-body text-xs font-semibold tracking-[0.8px] text-accent">MIGHT HELP</p>
            <p className="font-display text-[19px] font-bold tracking-[-0.5px] text-ink">
              Try this: brief before big prototype tasks
            </p>
          </div>
          <Pill variant="solid">~1 min per session</Pill>
        </div>
        <p className="font-body text-base leading-normal text-ink">
          Before a prototype session over 15 minutes, write the goal, user, done criteria and constraints. Skip
          it for quick fixes.
        </p>
      </div>
    </div>
  );
}

export function SampleReport() {
  return (
    <section id="sample-report" className="border-y border-rule bg-surface">
      <Container className="flex flex-col gap-14 py-20 lg:py-28">
        <Kicker>Sample report</Kicker>

        <article className="bg-paper outline outline-1 -outline-offset-1 outline-rule">
          {/* Summary */}
          <header className="flex flex-col gap-7 border-b border-rule px-5 pt-7 pb-8 md:px-10">
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-body text-sm text-text-2">Cycle review · Oct 12–25, 2026 · next review Nov 8</p>
              <Pill variant="neutral">Sample data</Pill>
            </div>
            <div className="flex flex-col gap-2.5">
              <h3 className="font-display text-[32px] font-bold tracking-[-0.8px] text-ink">Your two-week review</h3>
              <p className="max-w-[820px] font-body text-base leading-normal text-text-2">
                Your <Term name="briefedStarts">briefs</Term> got much better this year. Half your sessions now
                start with one, up from one in five, and <Term name="corrections">corrections</Term> nearly halved.
                Two things slipped: you <Term name="outputChecking">check prototypes</Term> less, and Gloss keeps{" "}
                <Term name="restarts">restarting</Term>.
              </p>
            </div>
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <h4 className="font-display text-lg font-bold text-ink">This cycle at a glance</h4>
                <p className="font-body text-sm text-text-3">Comparing Oct 12–25 to Sep 28 – Oct 11, 2026</p>
              </div>
              <dl className="grid grid-cols-1 divide-y divide-rule border-y border-rule md:grid-cols-5 md:divide-x md:divide-y-0">
                {glance.map((m, i) => (
                  <div key={m.label} className={`flex flex-col gap-1.5 py-4 ${i === 0 ? "md:pr-5" : "md:px-5"}`}>
                    <dt className="font-body text-[13px] text-text-3">
                      {m.term ? <Term name={m.term}>{m.label}</Term> : m.label}
                    </dt>
                    <dd className="flex items-end gap-2">
                      <span className="font-display text-[30px] leading-none font-bold text-ink">{m.value}</span>
                      <span className="pb-[3px] font-body text-[13px] text-text-2">{m.delta}</span>
                    </dd>
                    <dd className="font-body text-[13px] leading-[1.4] text-text-3">{m.note}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </header>

          {/* Part 1 */}
          <section className="flex flex-col gap-4 px-5 pt-8 pb-9 md:px-10">
            <PartTitle>Improve your prompts and context</PartTitle>
            <p className="font-body text-[15px] leading-normal text-text-2">
              Most <Term name="corrections">corrections</Term> start at the first message. Fix the brief and stop retyping rules to cut about a
              third of them.
            </p>
            <ol className="flex flex-col gap-4">
              {patterns.map((p, i) => (
                <li
                  key={p.title}
                  className={`flex flex-col gap-5 border-b border-rule last:border-b-0 md:px-7 ${p.expanded ? "pb-7" : "pb-[18px]"}`}
                >
                  <div className="flex items-center gap-3.5">
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
          </section>

          {/* Part 2 */}
          <section className="flex flex-col gap-4 border-t border-rule px-5 pt-8 pb-9 md:px-10">
            <PartTitle>Keep your skills current</PartTitle>
            <p className="font-body text-[15px] leading-normal text-text-2">
              Two of your seven skills give wrong information, and none has a test.
            </p>
            <p className="font-body text-[13px] text-text-3">
              Scanned Oct 21. 7 skills you wrote: 2 stale, 2 to review, 1 minor, 2 current. 17 installed: 2
              behind their source, 1 broken, 1 duplicate.
            </p>
            <SubTitle>Fix first</SubTitle>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-rule">
                    <Th>ISSUE</Th>
                    <Th className="w-[216px]">IMPACT</Th>
                    <Th className="w-[126px]">HOW SURE</Th>
                    <Th className="w-[200px]">FIX</Th>
                  </tr>
                </thead>
                <tbody>
                  {fixFirst.map((row) => (
                    <tr key={row.issue} className="border-b border-rule">
                      <Td className="font-body text-[15px] leading-normal font-medium text-ink">{row.issue}</Td>
                      <Td>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-body text-[15px] leading-[1.45] text-ink">{row.impact.main}</span>
                          <span className="font-body text-[13px] leading-[1.45] text-text-3">{row.impact.sub}</span>
                        </div>
                      </Td>
                      <Td className="font-body text-sm leading-normal text-text-2">{row.sure}</Td>
                      <Td className="font-body text-sm leading-normal text-text-2">{row.fix}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Part 3 */}
          <section className="flex flex-col gap-4 border-t border-rule px-5 pt-8 pb-10 md:px-10">
            <PartTitle>See how your habits change</PartTitle>
            <p className="font-body text-[15px] leading-normal text-text-2">
              12 months of sessions across claude.ai, Claude Code, Codex, Cursor and ChatGPT.
            </p>
            <div className="grid grid-cols-1 gap-8 pt-2 pb-4 sm:grid-cols-2 lg:grid-cols-4">
              {trends.map((t) => (
                <div key={t.label} className="flex flex-col gap-2.5 pt-4">
                  <p className="font-mono text-xs text-text-3">{t.label}</p>
                  <p className="flex items-end gap-1.5">
                    <span className="font-display text-[22px] leading-none font-medium text-ink">{t.value}</span>
                    <span className={`font-mono text-xs ${t.tone === "accent" ? "text-accent" : "text-text-2"}`}>
                      {t.delta}
                    </span>
                  </p>
                  <div className="flex flex-col gap-1 pt-1.5">
                    <Sparkline d={t.d} tone={t.tone} className="h-12" />
                    <div className="flex justify-between font-mono text-xs text-text-3">
                      <span>Nov</span>
                      <span>Oct</span>
                    </div>
                  </div>
                  <p className="font-body text-xs leading-[1.45] text-text-2">{t.explanation}</p>
                </div>
              ))}
            </div>

            <SubTitle>Did last cycle’s fixes work?</SubTitle>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-rule">
                    <Th>EXPERIMENT</Th>
                    <Th className="w-[76px]">TRIED?</Th>
                    <Th className="w-[186px]">HABIT CHANGED?</Th>
                    <Th className="w-[176px]">WORK GOT BETTER?</Th>
                    <Th className="w-[186px]">COSTS</Th>
                    <Th className="w-[150px]">DECISION</Th>
                  </tr>
                </thead>
                <tbody>
                  {experiments.map((row) => (
                    <tr key={row.name} className="border-b border-rule">
                      <Td className="font-body text-[15px] leading-[1.45] font-medium text-ink">{row.name}</Td>
                      <Td>
                        <CellText cell={row.tried} />
                      </Td>
                      <Td>
                        <CellText cell={row.habit} />
                      </Td>
                      <Td>
                        <CellText cell={row.work} />
                      </Td>
                      <Td>
                        <CellText cell={row.costs} />
                      </Td>
                      <Td>
                        <CellText cell={row.decision} />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="font-body text-[13px] text-text-3">“Not measured” means there’s no data yet.</p>
          </section>
        </article>
      </Container>
    </section>
  );
}
