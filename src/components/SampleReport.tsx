import { Check, ChevronRight, Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { SAMPLE_CHARTS, type SampleChart } from "@/lib/sample-charts";
import { CopyButton } from "./CopyButton";
import { Term } from "./Term";
import { Container, Kicker, Pill, type PillVariant } from "./ui";
import { Wordmark } from "./Wordmark";

// A condensed copy of plugins/second-look/skills/second-look/report-template.html. Its copy, numbers and styles come from there.
const confidence = {
  Sure: { variant: "strong", meaning: "Seen again and again, or checked directly in your files." },
  Likely: { variant: "neutral", meaning: "Shows up repeatedly, but something else could explain it." },
  Hunch: { variant: "dashed", meaning: "Thin evidence so far. Test it before you rely on it." },
} as const;

type Confidence = keyof typeof confidence;

const lastReview: { heading: string; icon: "keep" | "changed"; fixes: { name: string; result: string; detail: string }[] }[] = [
  {
    heading: "Keep doing these",
    icon: "keep",
    fixes: [
      {
        name: "Confirm the plan before editing",
        result: "Too soon to tell",
        detail: "You’re correcting the AI about as often as before, at 1.2 per 10 messages. The fix is only 2 weeks old.",
      },
      {
        name: "Send research comparisons to a helper agent",
        result: "Use rose from 11% to 18%",
        detail: "Sessions crowded with lookups stayed about the same.",
      },
    ],
  },
  {
    heading: "Changed since your last review",
    icon: "changed",
    fixes: [
      {
        name: "Brief before big prototype tasks",
        result: "Not tried yet, so it’s smaller now",
        detail: "It’s only for longer prototype sessions now. It’s fix 2 in your plan.",
      },
    ],
  },
];

const patterns: {
  title: string;
  tools: string;
  sure: Confidence;
  open?: boolean;
  happens: string;
  evidence: ReactNode;
  matters: string;
  quote?: { text: string; note: string };
  tryThis: { title: string; saves: string; how?: string; steps: ReactNode; prompt?: string };
}[] = [
  {
    title: "You retype the same rules across your tools",
    tools: "Claude Code · Codex · Cursor · claude.ai · ChatGPT",
    sure: "Sure",
    happens: "You type the same rules by hand, because only some of your tools have them saved.",
    evidence:
      "You retyped rules 27 times in the last 4 weeks. “just show the diff, skip the recap” alone came up in 9 sessions. Codex and ChatGPT are missing all 4 of your rules, Cursor 2.",
    matters: "You lose time every session, and Codex, Cursor and ChatGPT still answer without your rules.",
    tryThis: {
      title: "Add your rules to the tools missing them",
      saves: "Saves about 5 minutes a week",
      how: "About 7 rules retyped a week × under a minute each.",
      steps:
        "Copy the block once. Codex: paste it into a new session and say “Save these as my rules for every project.” Cursor: Cursor Settings, then Rules. ChatGPT: Settings → Personalization → Custom instructions. Claude Code and claude.ai already have them.",
      prompt:
        "- Confirm the plan before editing more than one file.\n- Show changes, not whole files. Skip the recap at the end.\n- Link the official docs when you tell me how a tool works.\n- Prototypes use React + Tailwind.",
    },
  },
  {
    title: "Prototype sessions start vague, then restart",
    tools: "Claude Code · Codex · Cursor · claude.ai",
    sure: "Likely",
    open: true,
    happens:
      "Your first message names what to build, but not who it’s for or what done looks like. You fill in the gaps over the next few messages, and sometimes start a new session.",
    evidence: (
      <>
        In the last 4 weeks, 16 of your 25 <Term name="restarts">restarts</Term> were prototype sessions, including 4
        Streak settings-screen sessions on Oct 14–15. In those 4 weeks, 44% of prototype sessions opened with a brief.
      </>
    ),
    matters: "Each restart repeats the setup, and without a definition of done it’s hard to tell when a prototype is finished.",
    quote: {
      text: "“build the settings screen for streak, make it look good and hook up reminders”",
      note: "How 3 of the 4 settings-screen restarts opened. The next 5–8 messages each added a missing piece, like who it was for or the stack.",
    },
    tryThis: {
      title: "Brief before big prototype tasks",
      saves: "Saves about 30 minutes a week",
      how: "About 2 restarts avoided a week × 15 minutes of repeated setup.",
      steps:
        "Starting a prototype that’s more than a quick tweak? Copy this as your first message and fill in the brackets. If you don’t know what done looks like yet, say so.",
      prompt:
        "Goal: [what this prototype should let someone do]\nUser: [who uses it]\nDone when: [what you'll check to call it finished]\nLimits: [tools to use, what to leave alone]\nBefore building, list up to 3 questions you need answered.",
    },
  },
  {
    title: "Prototypes often go out without a last check",
    tools: "Claude Code · Codex · claude.ai",
    sure: "Hunch",
    happens: "When a prototype looks done, the session often ends with no critique or test.",
    evidence:
      "3 prototypes went into the Streak beta with no check in the session, Oct 6–20. In the last 4 weeks, checking in prototype sessions fell from 43% to 23%, and Claude Code and Codex saved code they hadn’t tested 10 times.",
    matters: "Beta testers use what you ship, so a broken screen does more harm there than in a sketch.",
    tryThis: {
      title: "Check beta work before it ships",
      saves: "Means fewer fixes after launch",
      steps: "Only for work others will see. Paste this before you share it.",
      prompt: "What are the 3 most likely ways this breaks for a real user, and what did you assume that I didn't tell you?",
    },
  },
  {
    title: "Long sessions drift across projects and eat your usage",
    tools: "Claude Code · Codex",
    sure: "Likely",
    happens:
      "Some sessions jump from one project to the next without starting fresh. Every message in a very long session makes the AI re-read everything before it, including files from the earlier project.",
    evidence:
      "In the last 4 weeks, 14 of 72 Claude Code and Codex sessions were very long (past about a novel’s worth of text) and took 61% of your usage. A message in them took 2.6× the usage of your typical one. 2 ran past 60 messages across the onboarding flow, a Streak sync bug and a pricing page.",
    matters: "You reach your limit sooner, and leftovers from the last project can steer the next one.",
    tryThis: {
      title: "Start fresh between projects",
      saves: "Saves about a tenth of your Claude Code and Codex usage",
      how: "Very long sessions took 61% of that usage. Starting fresh could cut about a sixth of it.",
      steps: (
        <>
          When you switch projects or finish a piece of work, open a new session. In Claude Code,{" "}
          <code className="font-code text-[0.86em]">/clear</code> does the same. If the next task needs context, first
          ask: “Summarize this in five lines for a new session.” Paste that into the new session.
        </>
      ),
    },
  },
  {
    title: "Your strongest model does your simplest work",
    tools: "Claude Code",
    sure: "Likely",
    happens: "Every Claude Code session runs on Opus, including quick questions and lookups a cheaper model handles just as well.",
    evidence:
      "In the last 4 weeks, 19 of your 62 Claude Code sessions were short and changed no code. They took 14% of your usage on Opus.",
    matters: "Simple work on a cheaper model leaves more of your limit for the work that needs the strongest one.",
    tryThis: {
      title: "Match the model to the job",
      saves: "Saves about a tenth of your Claude Code usage",
      how: "Short sessions took 14% of it × the price gap to a cheaper model.",
      steps: (
        <>
          Switch before you start. In Claude Code and Codex, type <code className="font-code text-[0.86em]">/model</code>
          . In Cursor, use the model menu. If you correct a cheaper model twice, move up a level.
        </>
      ),
    },
  },
];

const plan: { fix: string; time: string; saves: string; checks: string; first?: string }[] = [
  {
    fix: "Add your rules to the tools missing them",
    time: "5 minutes, once",
    saves: "About 5 minutes a week",
    checks: "Rules retyped, and corrections in Codex and Cursor",
  },
  {
    fix: "Brief before big prototype tasks",
    time: "A minute before any prototype that’s more than a quick tweak",
    saves: "About 30 minutes a week",
    checks: "Briefed starts and restarts in prototype sessions",
  },
  {
    fix: "Check beta work before it ships",
    time: "5 minutes per piece others will see",
    saves: "Fewer fixes after launch",
    checks: "Output checking and untested changes shipped",
    first: "Better with your pr-review skill. Fix it when you have 5 minutes.",
  },
  {
    fix: "Start fresh between projects",
    time: "A habit, whenever you switch projects",
    saves: "About a tenth of your Claude Code and Codex usage",
    checks: "Long-session share",
  },
  {
    fix: "Match the model to the job",
    time: "A few seconds per session",
    saves: "About a tenth of your Claude Code usage",
    checks: "Corrections on cheaper models, usage on Opus",
  },
];

const skillsToFix: { skill: string; issue: string; note?: string; fix: string }[] = [
  {
    skill: "pr-review",
    issue: "names a tool that doesn’t exist, so the visual check can get skipped",
    note: "Fix 3 in your plan works better with it.",
    fix: "Paste the fix (5 min)",
  },
  {
    skill: "release-notes",
    issue: "still lists last quarter’s pricing tiers",
    note: "Its output goes into every changelog.",
    fix: "Paste the fix (5 min)",
  },
  {
    skill: "beta-feedback-synth",
    issue: "says the team has 4 engineers; your notes say 6",
    fix: "In claude.ai, paste: “Change the team size in my beta-feedback-synth skill from 4 to 6.” (1 min)",
  },
  {
    skill: "api-docs",
    issue: "is installed twice, and the claude.ai copy is older",
    note: "Two versions give different advice.",
    fix: "In claude.ai, paste: “Help me delete the older copy of my api-docs skill.”",
  },
  {
    skill: "mermaid-diagrams",
    issue: "is missing its main file, so it never loads",
    fix: "In Claude Code, paste: “Reinstall mermaid-diagrams.”",
  },
];

const worthALook: { issue: string; why: string; sure: Confidence; next: string }[] = [
  {
    issue: "Your team details are copied into beta-feedback-synth, ui-review and metrics-check",
    why: "The copies already disagree",
    sure: "Sure",
    next: "In claude.ai, paste: “Move my team details out of those three skills and into one shared file.”",
  },
  {
    issue: "Your skills are set up for Claude, with none for Codex. Cursor’s folder couldn’t be read.",
    why: "Codex and Cursor can run the same files",
    sure: "Likely",
    next: "In Claude Code, paste: “Copy my skills to Codex, then check my Cursor skills folder.”",
  },
  {
    issue: "ui-review doesn’t know about Claude Design, and loads all three platform guides every time",
    why: "It misses a current tool and loads more than it needs",
    sure: "Likely",
    next: "In claude.ai, paste: “Add Claude Design to my ui-review skill and have it load one platform guide at a time.”",
  },
  {
    issue: "No skill has a test",
    why: "A model update could change how a skill behaves without you noticing",
    sure: "Hunch",
    next: "In claude.ai, paste: “Write 3 test prompts for my release-notes and ui-review skills.”",
  },
  {
    issue: "commit-message and pdf-tools are behind their source.",
    why: "You may be missing fixes",
    sure: "Sure",
    next: "In Claude Code, paste: “Show me what changed in commit-message and pdf-tools since I installed them.”",
  },
];

const skillsYouWrote: { skill: string; where: string; status: string; variant: PillVariant; detail: string }[] = [
  { skill: "release-notes", where: "claude.ai", status: "Stale", variant: "red", detail: "Pricing tiers, description, no tests" },
  { skill: "pr-review", where: "This computer", status: "Stale", variant: "red", detail: "Names a tool that doesn’t exist" },
  { skill: "beta-feedback-synth", where: "claude.ai", status: "Stale", variant: "red", detail: "Team size, no tests" },
  { skill: "ui-review", where: "claude.ai", status: "Review", variant: "strong", detail: "Tool list; loads too much at once" },
  { skill: "metrics-check", where: "claude.ai", status: "Minor", variant: "neutral", detail: "Example query names an old table" },
  { skill: "explain-like-pm, test-plan", where: "claude.ai", status: "Current", variant: "outline", detail: "Nothing found" },
];

const skillsInstalled: { skill: string; status: string; variant: PillVariant; detail: string }[] = [
  { skill: "commit-message", status: "Behind", variant: "strong", detail: "You have v2.7.0 from Jul 13. The source was rewritten through Oct 16." },
  { skill: "pdf-tools", status: "Behind", variant: "strong", detail: "Source updated Jul 2, after you installed it Jun 4." },
  { skill: "mermaid-diagrams", status: "Broken", variant: "red", detail: "Missing its main file, so it never loads." },
  { skill: "api-docs", status: "Duplicate", variant: "strong", detail: "The claude.ai copy is older than the one on your computer." },
  { skill: "skill-creator, tailwind-components", status: "Current", variant: "outline", detail: "Match their sources." },
  { skill: "11 others", status: "Not checked", variant: "neutral", detail: "No source link, so there’s nothing to compare against." },
];

const automateNext: { ask: string; count: string; fix: string }[] = [
  {
    ask: "“Check the job tracker and summarize what changed”",
    count: "6 times in 4 weeks",
    fix: "Tell Claude Code: “Every Monday, check the job tracker and summarize what changed. Set that up as a scheduled task.”",
  },
  {
    ask: "“Rewrite this in my voice, no em dashes”",
    count: "5 times in 4 weeks",
    fix: "Tell your AI: “Save ‘rewrite this in my voice, no em dashes’ as a skill.”",
  },
  {
    ask: "“Run the report checker and fix what it flags”",
    count: "4 times in 4 weeks",
    fix: "Tell Claude Code: “After every edit, run the report checker and fix what it flags. Set that up to run on its own.”",
  },
];

const shareBars: { title: string; rows: readonly (readonly [string, number])[] }[] = [
  {
    title: "What you used AI for",
    rows: [
      ["Prototyping", 29],
      ["Advice", 21],
      ["Creating", 18],
      ["Research", 16],
      ["Brainstorming", 10],
      ["Career", 5],
    ],
  },
  {
    title: "Where you worked",
    rows: [
      ["claude.ai", 54],
      ["Claude Code", 20],
      ["ChatGPT", 16],
      ["Cursor", 6],
      ["Codex", 4],
    ],
  },
];

const card = "rounded-[14px] border border-report-line bg-report-surface";
const summaryBase = "cursor-pointer list-none [&::-webkit-details-marker]:hidden";
const chevron = "shrink-0 text-report-muted transition-transform duration-150 group-open:rotate-90";

function ConfidenceChip({ level }: { level: Confidence }) {
  return (
    <Pill variant={confidence[level].variant} title={confidence[level].meaning} className="cursor-help">
      {level}
    </Pill>
  );
}

function PartHead({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <h3 className="font-display text-[32px] leading-[1.25] font-bold tracking-[-0.025em] text-balance">{title}</h3>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h4 className="font-display text-xl leading-[1.3] font-bold tracking-[-0.025em]">{children}</h4>;
}

// Under 640px each table row becomes a small card: the first cell leads, the rest run their label into the value.
function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-report-line">
      <table className="w-full border-collapse text-sm max-sm:block">
        <thead className="max-sm:sr-only">
          <tr>
            {head.map((h) => (
              <th
                key={h}
                scope="col"
                className="border-b border-report-line px-2 py-3 text-left align-top leading-[1.4] font-medium whitespace-nowrap text-report-muted first:pl-4 last:pr-4"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="max-sm:block">{children}</tbody>
      </table>
    </div>
  );
}

function Tr({ children }: { children: ReactNode }) {
  return (
    <tr className="[&:last-child>td]:border-b-0 max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:gap-x-3 max-sm:border-b max-sm:border-report-line max-sm:px-4 max-sm:py-3 max-sm:last:border-b-0">
      {children}
    </tr>
  );
}

function Td({ label, lead, children }: { label?: string; lead?: boolean; children: ReactNode }) {
  return (
    <td
      className={`border-b border-report-line px-2 py-3 align-top leading-[1.35] first:pl-4 last:pr-4 max-sm:block max-sm:border-0 max-sm:p-0 max-sm:first:pl-0 max-sm:last:pr-0 ${lead ? "max-sm:col-start-1 max-sm:pb-1.5 max-sm:font-semibold" : "max-sm:col-span-full max-sm:py-0.5"}`}
    >
      {label && <span className="mr-2 text-[13px] text-report-muted sm:hidden">{label}</span>}
      {children}
    </td>
  );
}

// A lone chip takes the row's corner on phones, so it costs no line of its own.
function ChipTd({ children }: { children: ReactNode }) {
  return (
    <td className="border-b border-report-line px-2 py-3 align-top leading-[1.35] first:pl-4 last:pr-4 max-sm:col-start-2 max-sm:row-start-1 max-sm:block max-sm:border-0 max-sm:p-0 max-sm:last:pr-0">
      {children}
    </td>
  );
}

function Fold({ title, meta, children }: { title: string; meta: string; children: ReactNode }) {
  return (
    <details className="group border-t border-report-line last:border-b">
      <summary className={`${summaryBase} grid min-h-9 grid-cols-[auto_minmax(0,1fr)] items-start gap-3 py-2`}>
        <ChevronRight size={16} className={`${chevron} mt-0.5`} aria-hidden="true" />
        <span className="grid min-w-0">
          <span className="text-sm leading-5 font-medium">{title}</span>
          <span className="text-[13px] leading-[18px] text-report-muted">{meta}</span>
        </span>
      </summary>
      <div className="grid min-w-0 gap-3.5 pt-1 pb-5 pl-7">{children}</div>
    </details>
  );
}

function PromptBlock({ text }: { text: string }) {
  return (
    <div className="relative min-w-0">
      <pre className="rounded-lg border border-report-line bg-report-bg p-3 pr-[84px] font-code text-[13px] leading-5 break-words whitespace-pre-wrap text-report-fg max-sm:pt-9 max-sm:pr-3">
        {text}
      </pre>
      <span className="absolute top-1.5 right-1.5 max-sm:right-auto max-sm:left-1.5">
        <CopyButton text={text} label="Copy this prompt" bare />
      </span>
    </div>
  );
}

function PatternCard({ pattern, rank }: { pattern: (typeof patterns)[number]; rank: number }) {
  const { tryThis } = pattern;
  return (
    <details open={pattern.open} className={`group ${card}`}>
      <summary className={`${summaryBase} grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3 gap-y-1.5 p-5`}>
        <span className="row-span-2 grid size-9 place-items-center rounded-full bg-report-soft font-display text-lg leading-none font-bold text-accent tabular-nums">
          {rank}
        </span>
        <h5 className="font-display text-lg leading-[1.45] font-bold tracking-[-0.025em] text-balance">{pattern.title}</h5>
        <ChevronRight size={16} className={`${chevron} mt-1.5`} aria-hidden="true" />
        <p className="col-start-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] leading-[1.4] text-report-muted">
          {pattern.tools} <ConfidenceChip level={pattern.sure} />
        </p>
      </summary>
      <div className="grid gap-4 px-5 pb-5">
        <dl className="m-0 grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-sm leading-[22px] max-sm:grid-cols-1 max-sm:gap-y-0.5 max-sm:[&>dd]:mb-2.5">
          <dt className="text-report-muted">What happens</dt>
          <dd className="m-0 min-w-0">{pattern.happens}</dd>
          <dt className="text-report-muted">Evidence</dt>
          <dd className="m-0 min-w-0">{pattern.evidence}</dd>
          <dt className="text-report-muted">Why it matters</dt>
          <dd className="m-0 min-w-0">{pattern.matters}</dd>
        </dl>
        {pattern.quote && (
          <div className="border-l-2 border-report-line pl-3">
            <blockquote className="text-sm leading-[22px]">{pattern.quote.text}</blockquote>
            <p className="pt-1.5 text-[13px] leading-[18px] text-report-muted">{pattern.quote.note}</p>
          </div>
        )}
        <div className="grid gap-3 rounded-[10px] border border-report-soft-2 bg-report-soft p-4">
          <p className="text-base leading-normal font-semibold">Try this: {tryThis.title}</p>
          <p className="text-sm leading-5 font-semibold text-accent">
            {tryThis.saves}
            {tryThis.how && <span className="mt-0.5 block text-[13px] leading-[18px] font-normal text-report-muted">{tryThis.how}</span>}
          </p>
          <p className="text-sm leading-[22px]">{tryThis.steps}</p>
          {tryThis.prompt && <PromptBlock text={tryThis.prompt} />}
        </div>
      </div>
    </details>
  );
}

function Plan() {
  const columns = "md:grid-cols-[40px_minmax(0,1.2fr)_minmax(0,.9fr)_minmax(0,.9fr)_minmax(0,1fr)] md:gap-x-4";
  return (
    <section aria-labelledby="sample-plan" className="grid gap-2 rounded-[14px] border border-report-soft-2 bg-report-soft p-5">
      <h4 id="sample-plan" className="font-display text-2xl leading-[1.35] font-bold tracking-[-0.025em]">
        Your plan until Nov 8
      </h4>
      <div className={`mt-2 hidden text-[13px] font-medium text-report-muted md:grid ${columns}`} aria-hidden="true">
        <span className="col-start-3">Time</span>
        <span>Saves</span>
        <span>Nov 8 review checks</span>
      </div>
      <ol className="m-0 list-none p-0">
        {plan.map((row, i) => (
          <li
            key={row.fix}
            className={`grid grid-cols-[40px_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 border-t border-report-soft-2 py-4 text-sm leading-normal md:py-3.5 ${columns}`}
          >
            <span className="row-span-4 font-display text-[32px] leading-[1.1] font-bold text-accent tabular-nums">{i + 1}</span>
            <span className="leading-[1.35] font-semibold">{row.fix}</span>
            <span>{row.time}</span>
            <span>
              <span className="md:hidden">Saves: </span>
              {row.saves}
            </span>
            <span className="text-report-muted">
              <span className="md:hidden">Nov 8 checks: </span>
              {row.checks}
            </span>
            {row.first && <span className="col-start-2 md:col-span-4">{row.first}</span>}
          </li>
        ))}
      </ol>
      <p className="border-t border-report-soft-2 pt-3 text-sm leading-normal text-report-muted">
        When these are done: the other skill fixes, then the repeats you could automate.
      </p>
    </section>
  );
}

function ChartCard({ chart }: { chart: SampleChart }) {
  const axisText = "fill-report-muted text-[10px] tabular-nums";
  const haloText = "[paint-order:stroke] [stroke-linejoin:round] [stroke-width:3px] stroke-report-surface";
  return (
    <div className={`${card} mb-3 grid min-w-0 grid-rows-subgrid p-4 [grid-row:span_4]`}>
      <h5 className="font-display text-base leading-[1.3] font-bold tracking-[-0.025em]">
        <Term name={chart.term}>{chart.title}</Term>
      </h5>
      <p className="mt-2 text-sm leading-normal text-report-muted">{chart.def}</p>
      <svg viewBox="0 0 340 162" aria-hidden="true" className="mt-2.5 block h-auto w-full overflow-visible">
        {[140, 82, 24].map((y, i) => (
          <g key={y}>
            <line x1="36" x2="330" y1={y} y2={y} className="stroke-report-line" />
            <text x="30" y={y + 3} textAnchor="end" className={axisText}>
              {chart.yTicks[i]}
            </text>
          </g>
        ))}
        {[
          [93.6, "Jan"],
          [168.6, "Apr"],
          [243.5, "Jul"],
          [318.5, "Oct"],
        ].map(([x, month]) => (
          <text key={month} x={x} y="156" textAnchor="middle" className={axisText}>
            {month}
          </text>
        ))}
        <line x1="145.5" x2="145.5" y1="24" y2="140" className="stroke-report-line" />
        <line x1="249.3" x2="249.3" y1="24" y2="140" className="stroke-report-line" />
        <line x1="312.7" x2="312.7" y1="2" y2="140" className="stroke-report-line-strong" />
        <text x="309.7" y="10" textAnchor="end" className={`${axisText} ${haloText}`}>
          Streak redesign starts
        </text>
        <path d={chart.line} fill="none" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" className="stroke-accent" />
        <circle cx={chart.was[0]} cy={chart.was[1]} r="4" strokeWidth="2" className="fill-report-surface stroke-accent" />
        <circle cx={chart.now[0]} cy={chart.now[1]} r="4" strokeWidth="2" className="fill-accent stroke-accent" />
        <text x="335" y={chart.nowLabel.y} textAnchor="end" className={`text-[10px] font-semibold tabular-nums fill-report-fg ${haloText}`}>
          {chart.nowLabel.text}
        </text>
        {chart.wasLabel && (
          <text x={chart.wasLabel.x} y={chart.wasLabel.y} textAnchor="end" className={`${axisText} font-semibold ${haloText}`}>
            {chart.wasLabel.text}
          </text>
        )}
      </svg>
      {chart.read ? <p className="mt-2 text-sm leading-normal text-report-muted">{chart.read}</p> : <span />}
    </div>
  );
}

export function SampleReport() {
  return (
    <section id="sample-report" className="border-y border-rule bg-surface">
      <Container className="flex flex-col gap-14 py-20 lg:py-28">
        <Kicker as="h2">Sample report</Kicker>

        <article className="mx-auto grid w-full max-w-[960px] min-w-0 gap-14 rounded-[14px] border border-report-line bg-report-bg px-4 py-7 text-report-fg sm:px-10 sm:py-10">
          <header className="grid gap-5">
            <div className="flex items-end justify-between gap-4">
              <Wordmark className="h-8 w-auto" />
              <p className="text-sm whitespace-nowrap text-report-muted tabular-nums">{"Oct 25, 2026"}</p>
            </div>
            <p className="text-xl leading-normal text-pretty">
              Over the past year, you’ve gotten better at explaining what you want, and the AI misreads you less. Lately
              the Streak redesign pulled the other way: you’ve been checking prototypes less and starting over more often.
            </p>
          </header>

          {/* Prompts and setup */}
          <section className="grid gap-5">
            <PartHead title="Improve your prompts and setup">
              <p className="text-base leading-normal text-pretty text-report-muted">
                Vague prototype starts take the most time. Syncing your rules is the quickest fix, so it comes first. Five
                fixes below, all in your plan until Nov 8.
              </p>
            </PartHead>

            <div className="grid gap-3">
              <h4 className="font-display text-xl leading-[1.4] font-bold tracking-[-0.025em]">
                Did the fixes from your last review work?
              </h4>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] items-start gap-3">
                {lastReview.map((group) => (
                  <div key={group.heading} className={`grid min-w-0 ${card}`}>
                    <h5 className="flex min-h-11 items-center gap-2 rounded-t-[13px] bg-report-soft px-4 text-sm leading-[1.4] font-semibold text-accent">
                      {group.icon === "keep" ? <Check size={16} aria-hidden="true" /> : <Pencil size={16} aria-hidden="true" />}
                      {group.heading}
                    </h5>
                    {group.fixes.map((fix, i) => (
                      <details key={fix.name} open={group.icon === "keep" && i === 0} className="group border-report-line [&+details]:border-t">
                        <summary className={`${summaryBase} grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 p-4`}>
                          <span className="grid min-w-0">
                            <span className="text-sm leading-[1.45] font-semibold">{fix.name}</span>
                            <span className="mt-0.5 text-sm leading-[1.45] text-report-muted">{fix.result}</span>
                          </span>
                          <ChevronRight size={16} className={`${chevron} mt-0.5`} aria-hidden="true" />
                        </summary>
                        <p className="px-4 pb-4 text-[13px] leading-[1.45] text-report-muted">{fix.detail}</p>
                      </details>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {patterns.map((pattern, i) => (
              <PatternCard key={pattern.title} pattern={pattern} rank={i + 1} />
            ))}

            <Plan />
          </section>

          {/* Skills */}
          <section className="grid gap-5">
            <PartHead title="Keep your skills current">
              <p className="text-base leading-normal text-pretty text-report-muted">Three of your seven skills give wrong information today.</p>
              <p className="text-sm text-report-muted">
                Checked Oct 25: 7 skills you wrote, 17 you installed. Couldn’t read your Cursor skills folder, so any skills
                there aren’t counted.
              </p>
            </PartHead>

            <div className="grid gap-3.5">
              <SectionTitle>Skills to fix</SectionTitle>
              <Table head={["Issue", "Fix"]}>
                {skillsToFix.map((row) => (
                  <Tr key={row.skill}>
                    <Td lead>
                      <b className="font-semibold">{row.skill}</b> {row.issue}
                      {row.note && <span className="mt-1 block leading-normal font-normal text-report-muted">{row.note}</span>}
                    </Td>
                    <Td label="Fix">{row.fix}</Td>
                  </Tr>
                ))}
              </Table>
            </div>

            <div className="grid gap-3.5">
              <SectionTitle>Worth a look</SectionTitle>
              <Table head={["Issue", "Why it matters", "How sure", "Next step"]}>
                {worthALook.map((row) => (
                  <Tr key={row.issue}>
                    <Td lead>{row.issue}</Td>
                    <Td label="Why it matters">{row.why}</Td>
                    <ChipTd>
                      <ConfidenceChip level={row.sure} />
                    </ChipTd>
                    <Td label="Next step">{row.next}</Td>
                  </Tr>
                ))}
              </Table>
            </div>

            <div>
              <Fold title="Skills you wrote" meta="3 stale · 1 to review · 1 minor · 2 current">
                <Table head={["Skill", "Where", "Status", "What’s out of date"]}>
                  {skillsYouWrote.map((row) => (
                    <Tr key={row.skill}>
                      <Td lead>{row.skill}</Td>
                      <Td label="Where">{row.where}</Td>
                      <ChipTd>
                        <Pill variant={row.variant}>{row.status}</Pill>
                      </ChipTd>
                      <Td label="What’s out of date">{row.detail}</Td>
                    </Tr>
                  ))}
                </Table>
              </Fold>
              <Fold title="Skills you installed from others" meta="2 behind their source · 1 broken · 1 duplicate · 2 current · 11 not checked">
                <Table head={["Skill", "Status", "Detail"]}>
                  {skillsInstalled.map((row) => (
                    <Tr key={row.skill}>
                      <Td lead>{row.skill}</Td>
                      <ChipTd>
                        <Pill variant={row.variant}>{row.status}</Pill>
                      </ChipTd>
                      <Td label="Detail">{row.detail}</Td>
                    </Tr>
                  ))}
                </Table>
                <p className="text-sm leading-normal text-report-muted">Update these from their source. Edits you make to them get overwritten.</p>
              </Fold>
            </div>
          </section>

          {/* Habits, last */}
          <section className="grid gap-5">
            <PartHead title="How your habits are changing">
              <p className="text-sm leading-[1.6] text-report-muted max-sm:text-base">
                A full year of claude.ai; Claude Code since Jun 29; Codex since Apr 20; Cursor since Feb 9; a full year of
                ChatGPT. Gemini isn’t added.
              </p>
            </PartHead>
            <p className="text-base leading-normal text-pretty">
              In the last 4 weeks, you restarted more tasks and checked the work less often.
            </p>

            <div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-x-3">
                {SAMPLE_CHARTS.map((chart) => (
                  <ChartCard key={chart.title} chart={chart} />
                ))}
              </div>

              <div className={`${card} grid p-4`}>
                <h4 className="mb-2 text-base leading-normal font-semibold">What you could automate next</h4>
                {automateNext.map((row) => (
                  <div
                    key={row.ask}
                    className="grid items-baseline gap-x-4 gap-y-1 border-t border-report-line py-3 text-sm leading-5 md:grid-cols-[minmax(0,1fr)_150px_minmax(0,1.3fr)]"
                  >
                    <span>{row.ask}</span>
                    <span className="font-code text-[13px] leading-[18px] whitespace-nowrap text-accent tabular-nums">{row.count}</span>
                    <span className="text-report-muted">{row.fix}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-3">
              {shareBars.map((panel) => (
                <div key={panel.title} className={`${card} grid min-w-0 content-start gap-2 p-4`}>
                  <h4 className="mb-0.5 text-base leading-normal font-semibold">{panel.title}</h4>
                  <div className="grid gap-0.5">
                    {panel.rows.map(([name, share]) => (
                      <div key={name} className="grid min-h-8 grid-cols-[100px_minmax(0,1fr)_40px] items-center gap-2 py-1 text-[13px]">
                        <span>{name}</span>
                        <span className="relative h-1.5 rounded-full bg-report-surface-2">
                          <span className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${share}%` }} />
                        </span>
                        <span className="text-right text-report-muted tabular-nums">{share}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm leading-5">
              Over the last 12 months, you brief least in research (37%) and check least in prototyping (40%).
            </p>
          </section>
        </article>
      </Container>
    </section>
  );
}
