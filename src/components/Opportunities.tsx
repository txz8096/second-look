import { ArrowUpRight } from "lucide-react";
import { links } from "@/lib/site";
import { FeatureSection, ReportExcerpt } from "./ReportExamples";

const fixes = [
  {
    anchor: "p-rules",
    title: "You retype the same rules across your apps",
    suggestion: "Ask Codex to fill gaps in your saved rules across the AI apps you use.",
    benefit: "Saves retyping and waiting for extra replies",
  },
  {
    anchor: "p-brief",
    title: "Prototype sessions start vague, then restart",
    suggestion: "Ask Codex to set up a rule that starts substantial prototype work with an approved brief.",
    benefit: "Estimated savings of about 30 minutes a week",
  },
];

export function Opportunities() {
  return (
    <FeatureSection
      id="opportunities"
      kicker="Briefs & setup"
      title="Too much back-and-forth with AI?"
      description="You repeat the same instructions, clarify what you meant halfway through, or catch mistakes right before sharing. Second Look reviews your sessions for recurring patterns and suggests what to change in your briefs, saved instructions, or final checks."
    >
      <div className="grid gap-6 lg:min-h-[576px] lg:content-between">
        {fixes.map(({ anchor, title, suggestion, benefit }) => (
          <ReportExcerpt key={anchor} title="Suggested fix" className="w-full max-w-[456px] last:justify-self-end">
            <div className="flex flex-col items-start gap-3 px-4 py-5 sm:px-6">
              <h4 className="font-display text-lg leading-snug font-bold">{title}</h4>
              <p className="text-sm leading-relaxed text-text-2">{suggestion}</p>
              <p className="text-sm font-medium text-accent">{benefit}</p>
              <a
                href={`${links.sampleReport}#${anchor}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-accent px-3 text-sm font-medium text-on-accent hover:bg-accent/90"
              >
                View sample fix <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          </ReportExcerpt>
        ))}
      </div>
    </FeatureSection>
  );
}
