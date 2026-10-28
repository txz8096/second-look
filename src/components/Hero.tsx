import { CornerDownRight } from "lucide-react";
import type { CSSProperties } from "react";
import { HERO_PLOT, SPARKLINES } from "@/lib/paths";
import { links } from "@/lib/site";
import { GithubIcon } from "./Icons";
import { Sparkline } from "./Sparkline";
import { Term } from "./Term";
import { Container, PrimaryButton, SecondaryButton } from "./ui";

// Axis labels sit in HTML over the plot so they keep their size when the SVG scales down on phones.
// Positions are in viewBox units: y is the gridline each label centers on, x is the label's left edge.
const PLOT_WIDTH = 492;
const PLOT_HEIGHT = 150;

// Entrance timing in ms: the text staggers in, the card follows, then the plot draws and the sparklines trail it.
const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;
const CARD_IN = 240;
const PLOT_IN = CARD_IN + 300;

const yLabels = [
  { label: "0", y: 144 },
  { label: "1", y: 84 },
  { label: "2", y: 24 },
];

const xLabels = [
  { label: "Jan", x: 104.4 },
  { label: "Apr", x: 219.1 },
  { label: "Jul", x: 333.8 },
  { label: "Oct", x: 448.5 },
];

const signals = [
  { label: "Briefed starts", term: "briefedStarts", value: "56%", delta: "+39 pts", d: SPARKLINES.briefedStarts },
  { label: "Output checking", term: "outputChecking", value: "29%", delta: "−1 pt", d: SPARKLINES.outputChecking },
  { label: "Restarts", term: "restarts", value: "10%", delta: "+3 pts", d: SPARKLINES.restarts },
] as const;

function CorrectionsPlot() {
  return (
    <div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Corrections per 10 messages by week over the last 12 months, falling from about 1.9 to 1.1"
        >
          <path d={HERO_PLOT.gridlines} fill="none" strokeWidth={1} className="stroke-rule" vectorEffect="non-scaling-stroke" />
          <g className="wipe-in" style={delay(PLOT_IN)}>
            <path
              d={HERO_PLOT.eachWeek}
              fill="none"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-accent"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        </svg>
        <div className="font-mono text-xs text-text-3" aria-hidden="true">
          {yLabels.map((t) => (
            <span
              key={t.label}
              className="absolute left-0 -translate-y-1/2 leading-none"
              style={{ top: `${(t.y / PLOT_HEIGHT) * 100}%` }}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>
      <div className="relative mt-1.5 h-4 font-mono text-xs text-text-3" aria-hidden="true">
        {xLabels.map((t) => (
          <span key={t.label} className="absolute top-0" style={{ left: `${(t.x / PLOT_WIDTH) * 100}%` }}>
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function AnnotatedTrace() {
  return (
    <figure
      style={delay(CARD_IN)}
      className="rise-in w-full rounded-[10px] bg-surface shadow-[0_12px_20px_#1a1a1814] outline outline-1 -outline-offset-1 outline-rule lg:w-[540px] lg:shrink-0">
      <div className="border-b border-rule px-6 py-4">
        <p className="font-mono text-xs text-text-3">Last 12 months · 1,148 sessions</p>
      </div>
      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-3.5">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="font-body text-base text-ink">Corrections per 10 messages</p>
              <p className="font-body text-xs leading-[1.45] text-text-3">
                How often you redirect or fix the AI. Lower means it understood you sooner.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <p className="font-display text-[30px] leading-none font-medium text-ink">1.1</p>
              <p className="font-mono text-xs text-text-2">−0.8 since Nov</p>
            </div>
          </div>
          <CorrectionsPlot />
        </div>

        <div className="grid grid-cols-3 gap-6 border-t border-rule pt-[18px]">
          {signals.map((s, i) => (
            <div key={s.label} className="flex flex-col gap-2">
              <p className="font-mono text-xs text-text-3">
                <Term name={s.term}>{s.label}</Term>
              </p>
              <p className="flex items-end gap-1.5">
                <span className="font-display text-[22px] leading-none font-medium text-ink">{s.value}</span>
                <span className="font-mono text-xs text-text-2">
                  {s.delta}
                </span>
              </p>
              <Sparkline d={s.d} delay={PLOT_IN + 400 + i * 80} />
            </div>
          ))}
        </div>

        <figcaption className="flex gap-3 rounded-lg bg-accent-tint px-4 py-3.5">
          <CornerDownRight size={16} className="mt-[3px] shrink-0 text-accent" aria-hidden="true" />
          <p className="font-body text-sm leading-[1.55] text-ink">
            Observed: <Term name="briefedStarts">briefs</Term> keep improving, but{" "}
            <Term name="outputChecking">output checks</Term> fell from about half in July to 29%.
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
          <p className="rise-in font-mono text-[13px] tracking-[1.2px] text-accent">OPEN-SOURCE REFLECTION SKILL</p>
          <h1 style={delay(60)} className="rise-in font-display text-[44px] leading-[1.02] font-bold tracking-[-1.1px] text-ink md:text-[64px] md:tracking-[-1.6px]">
            Learn from how you work with AI.
          </h1>
          <p style={delay(120)} className="rise-in font-body text-lg leading-[1.55] text-text-2 md:text-xl">
            Second Look reviews your sessions across AI tools and suggests a few changes to test. Each one
            cites the sessions it came from.
          </p>
          <div style={delay(180)} className="rise-in flex flex-wrap items-center gap-3 pt-3">
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
