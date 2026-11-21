import { ArrowUpRight } from "lucide-react";
import { links } from "@/lib/site";
import { FeatureSection, ReportExcerpt } from "./ReportExamples";

const sampleCoverage = [
  { app: "claude.ai", status: "Export · Oct 19", spans: [[0, 52]] },
  { app: "Claude Code", status: "Since Jun 29", spans: [[35, 52]], outside: 35 },
  { app: "Codex", status: "Since Apr 20", spans: [[25, 52]] },
  { app: "Cursor", status: "Since Feb 9", spans: [[15, 52]] },
  { app: "Antigravity", status: "Not found", spans: [] },
  { app: "ChatGPT", status: "Export · Oct 12", spans: [[0, 48], [49, 51]], outside: 0, after: 51 },
  { app: "Gemini", status: "Export needed", spans: [], outside: 52 },
];

const yearWeeks = 52;
const weekPercent = (weeks: number) => `${100 * weeks / yearWeeks}%`;

export function Coverage() {
  return (
    <FeatureSection
      id="coverage"
      title="Which of your AI chats made it into the review?"
      description="Second Look finds patterns across all your AI apps."
      link={
        <a href={`${links.github}#supported-apps`} className="inline-flex min-h-11 items-center gap-2 self-start text-accent underline-offset-4 hover:underline">
          Coverage details on GitHub <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      }
    >
      <ReportExcerpt title="Data coverage">
        <div className="px-4 py-4 sm:px-6">
          <p className="sr-only">Sample coverage from October 2025 to October 2026.</p>
          <div aria-hidden="true" className="hidden items-center gap-2 pb-2 text-xs text-text-3 sm:grid sm:grid-cols-[100px_minmax(0,1fr)_112px]">
            <span>App</span>
            <div className="flex justify-between gap-1">
              <span>Oct ’25</span><span>Jan</span><span>Apr</span><span>Jul</span><span>Oct ’26</span>
            </div>
            <span>Coverage</span>
          </div>
          <ul className="border-t border-rule">
            {sampleCoverage.map(({ app, status, spans, outside, after }) => (
              <li key={app} className="grid grid-cols-2 items-center gap-x-2 gap-y-1 border-b border-rule py-2 text-sm last:border-b-0 sm:grid-cols-[100px_minmax(0,1fr)_112px]">
                <span className="font-medium text-ink">{app}</span>
                <div className="relative col-span-2 row-start-2 h-2 overflow-hidden rounded-sm bg-surface sm:col-span-1 sm:row-start-auto" aria-hidden="true">
                  {outside ? <span className="absolute inset-y-0 left-0 bg-text-3" style={{ width: weekPercent(outside) }} /> : null}
                  {spans.map(([start, end]) => (
                    <span key={start} className="absolute inset-y-0 rounded-sm bg-accent" style={{ left: weekPercent(start), width: weekPercent(end - start) }} />
                  ))}
                  {after != null && <span className="absolute inset-y-0 right-0 bg-text-3" style={{ width: weekPercent(yearWeeks - after) }} />}
                </div>
                <span className="col-start-2 row-start-1 text-right text-text-3 sm:col-start-auto sm:row-start-auto sm:text-left">{status}</span>
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 pt-3 text-xs text-text-3" aria-hidden="true">
            <li className="flex items-center gap-2"><span className="h-2 w-4 rounded-sm bg-accent" />Data</li>
            <li className="flex items-center gap-2"><span className="h-2 w-4 rounded-sm bg-surface" />No sessions</li>
            <li className="flex items-center gap-2"><span className="h-2 w-4 rounded-sm bg-text-3" />Outside coverage</li>
          </ul>
        </div>
      </ReportExcerpt>
    </FeatureSection>
  );
}
