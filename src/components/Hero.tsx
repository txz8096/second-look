import { CornerDownRight } from "lucide-react";
import { HERO_PLOT, SPARKLINES } from "@/lib/paths";
import { links } from "@/lib/site";
import { GithubIcon } from "./Icons";
import { Sparkline } from "./Sparkline";
import { Container, PrimaryButton, SecondaryButton } from "./ui";

const yLabels = [
  { label: "0%", y: 137 },
  { label: "40%", y: 77 },
  { label: "80%", y: 17 },
];

const xLabels = [
  { label: "Jan", x: 104.4 },
  { label: "Apr", x: 219.1 },
  { label: "Jul", x: 333.8 },
  { label: "Oct", x: 448.5 },
];

const signals = [
  { label: "Corrections / 10 msgs", value: "1.1", delta: "−0.8", tone: "muted", d: SPARKLINES.corrections },
  { label: "Output checking", value: "29%", delta: "−1 pt", tone: "accent", d: SPARKLINES.outputChecking },
  { label: "Restarts", value: "10%", delta: "+3 pts", tone: "muted", d: SPARKLINES.restarts },
] as const;

function BriefedStartsPlot() {
  return (
    <svg
      viewBox={HERO_PLOT.viewBox}
      className="block h-auto w-full"
      role="img"
      aria-label="Briefed starts by week over the last 12 months, rising from about 20% to 56%"
    >
      <path d={HERO_PLOT.gridlines} fill="none" strokeWidth={1} className="stroke-rule" vectorEffect="non-scaling-stroke" />
      <path
        d={HERO_PLOT.eachWeek}
        fill="none"
        strokeWidth={1}
        strokeLinejoin="round"
        className="stroke-accent opacity-40"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={HERO_PLOT.fourWeekAverage}
        fill="none"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-accent"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={HERO_PLOT.latestWeek.cx}
        cy={HERO_PLOT.latestWeek.cy}
        r={4.5}
        className="fill-accent stroke-surface"
      />
      <g className="fill-text-3 font-mono text-[10px]" dominantBaseline="text-before-edge">
        {yLabels.map((t) => (
          <text key={t.label} x={0} y={t.y}>
            {t.label}
          </text>
        ))}
        {xLabels.map((t) => (
          <text key={t.label} x={t.x} y={156}>
            {t.label}
          </text>
        ))}
      </g>
    </svg>
  );
}

function AnnotatedTrace() {
  return (
    <figure className="w-full rounded-[10px] bg-surface shadow-[0_12px_20px_#1a1a1814] outline outline-1 -outline-offset-1 outline-rule lg:w-[540px] lg:shrink-0">
      <div className="border-b border-rule px-6 py-4">
        <p className="font-mono text-xs text-text-3">Last 12 months · 1,148 sessions</p>
      </div>
      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-3.5">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="font-body text-base text-ink">Briefed starts</p>
              <p className="font-body text-xs leading-[1.45] text-text-3">
                First message gives the goal, the context and what done looks like.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <p className="font-display text-[30px] leading-none font-medium text-ink">56%</p>
              <p className="font-mono text-[11px] text-accent">+39 pts since Nov</p>
            </div>
          </div>
          <BriefedStartsPlot />
        </div>

        <div className="grid grid-cols-3 gap-6 border-t border-rule pt-[18px]">
          {signals.map((s) => (
            <div key={s.label} className="flex flex-col gap-2">
              <p className="font-mono text-[11px] text-text-3">{s.label}</p>
              <p className="flex items-end gap-1.5">
                <span className="font-display text-[22px] leading-none font-medium text-ink">{s.value}</span>
                <span className={`font-mono text-[11px] ${s.tone === "accent" ? "text-accent" : "text-text-2"}`}>
                  {s.delta}
                </span>
              </p>
              <Sparkline d={s.d} tone={s.tone} />
            </div>
          ))}
        </div>

        <figcaption className="flex gap-3 rounded-lg bg-accent-tint px-4 py-3.5">
          <CornerDownRight size={16} className="mt-[3px] shrink-0 text-accent" aria-hidden="true" />
          <p className="font-body text-sm leading-[1.55] text-ink">
            Observed: briefs keep improving, but output checks fell from about half in July to 29%.
          </p>
        </figcaption>
      </div>
    </figure>
  );
}

export function Hero() {
  return (
    <section id="top" className="bg-paper">
      <Container className="flex flex-col items-center gap-16 pt-16 pb-20 lg:flex-row lg:gap-20 lg:pt-24 lg:pb-28">
        <div className="flex w-full flex-col gap-7">
          <p className="font-mono text-[13px] tracking-[1.2px] text-accent">OPEN-SOURCE REFLECTION SKILL</p>
          <h1 className="font-display text-[44px] leading-[1.02] font-bold tracking-[-1.1px] text-ink md:text-[64px] md:tracking-[-1.6px]">
            Learn from how you work with AI.
          </h1>
          <p className="font-body text-lg leading-[1.55] text-text-2 md:text-xl">
            Second Look reviews your sessions across AI tools and suggests a few changes to test. Each one
            cites the sessions it came from.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <PrimaryButton href="#sample-report">See a sample report</PrimaryButton>
            <SecondaryButton href={links.github}>
              <GithubIcon size={18} />
              Get the skill
            </SecondaryButton>
          </div>
        </div>
        <AnnotatedTrace />
      </Container>
    </section>
  );
}
