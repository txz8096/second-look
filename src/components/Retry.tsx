import { ArrowUpRight } from "lucide-react";
import { links } from "@/lib/site";
import { FeatureSection, ReportExcerpt } from "./ReportExamples";

const sessionDates = ["Sep 29", "Oct 2", "Oct 7", "Oct 10", "Oct 15", "Oct 21"];

function GoalExample() {
  return (
    <article className="w-full max-w-[520px] min-w-0 overflow-hidden rounded-[14px] border border-white/15 bg-neutral-900 shadow-xl shadow-black/30">
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
        <h3 className="font-display text-base leading-snug font-bold text-neutral-400">A goal you keep coming back to</h3>
        <p className="text-[13px] whitespace-nowrap text-neutral-500">Claude Code</p>
      </header>
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="flex flex-col gap-1">
          <h4 className="font-display text-lg leading-snug font-bold text-neutral-50">Make the portfolio site load faster</h4>
          <p className="text-sm text-neutral-400">6 sessions in the last 4 weeks, each with a different request</p>
        </div>
        <ol aria-label="Sessions toward this goal, then the new model release" className="flex items-start">
          {sessionDates.map((date) => (
            <li key={date} className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-center" aria-hidden="true">
                <span className="size-3 shrink-0 rounded-full bg-neutral-400" />
                <span className="h-px flex-1 bg-white/15" />
              </div>
              <span className="text-xs whitespace-nowrap text-neutral-500 sm:text-[13px]"><span className="sr-only">Session on </span>{date}</span>
            </li>
          ))}
          <li className="flex w-11 shrink-0 flex-col gap-2 sm:w-[72px]">
            <span className="size-3.5 rotate-45 rounded-[3px] bg-accent" aria-hidden="true" />
            <span className="text-xs font-semibold whitespace-nowrap text-accent sm:text-[13px]"><span className="sr-only">New model released on </span>Oct 22</span>
          </li>
        </ol>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-white/10 pt-4 text-sm">
          <p className="text-neutral-400">Best so far: 2.4 seconds to first view</p>
          <p className="font-semibold text-accent">New Fable model</p>
        </div>
      </div>
    </article>
  );
}

export function Retry() {
  return (
    <FeatureSection
      id="retry"
      title="Still chasing the same goal?"
      description="Second Look flags goals to retry when a new model ships."
    >
      <div className="flex flex-col gap-6 lg:gap-0">
        <GoalExample />
        <ReportExcerpt title="Recommendation" tone="report" className="w-full max-w-[480px] lg:relative lg:-mt-2 lg:ml-[232px]">
          <div className="flex flex-col items-start gap-3 px-4 py-5 sm:px-6">
            <h4 className="font-display text-lg leading-snug font-bold">A new model could push your page speed further</h4>
            <p className="text-sm leading-relaxed text-text-2">Ask Claude Code, on the new Fable model, to plan your next round of page-speed experiments.</p>
            <p className="text-sm font-medium text-accent">A fresh try at work you’ve spent 6 sessions on</p>
            <div className="w-full rounded-lg border border-white/10 bg-neutral-950 px-4 py-3 font-code text-[13px] leading-normal text-neutral-400">
              <p>Goal: make my portfolio site load faster.</p>
              <p>Propose 3–5 experiments I haven’t tried…</p>
            </div>
            <a
              href={`${links.sampleReport}#p-retry`}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-accent px-3 text-sm font-medium text-on-accent hover:bg-accent/90"
            >
              View sample recommendation <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </ReportExcerpt>
      </div>
    </FeatureSection>
  );
}
