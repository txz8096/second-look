import { links } from "@/lib/site";
import { CopyButton } from "./CopyButton";
import { FeatureSection, ReportExcerpt } from "./ReportExamples";

const weeklyShare = [
  { date: "Jul 27", percent: 51, tick: true },
  { date: "Aug 3", percent: 52 },
  { date: "Aug 10", percent: 53 },
  { date: "Aug 17", percent: 54 },
  { date: "Aug 24", percent: 54, tick: true },
  { date: "Aug 31", percent: 55 },
  { date: "Sep 7", percent: 56 },
  { date: "Sep 14", percent: 57 },
  { date: "Sep 21", percent: 58, tick: true },
  { date: "Sep 28", percent: 58 },
  { date: "Oct 5", percent: 59 },
  { date: "Oct 12", percent: 60 },
  { date: "Oct 19", percent: 61, tick: true },
];

const skillPrompt = 'Update my pr-review skill. Its tool table names the wrong agent. Change the two column headings to "Claude desktop (built-in browser)" and "Claude Code, Codex, Cursor and others".\nThen tell me in plain words what changed before you save it.';

const skillFindings = [
  { name: "pr-review", issue: "Names a tool that doesn’t exist.", anchor: "fix-pr-review", action: "Paste the fix" },
  { name: "release-notes", issue: "Still lists last quarter’s pricing tiers.", anchor: "fix-release-notes", action: "Paste the fix" },
  { name: "beta-feedback-synth", issue: "Says the team has 4 engineers. Your notes say 6.", anchor: "fix-first", action: "See fix for claude.ai" },
];

function UsageExample() {
  return (
    <ReportExcerpt title="Where does my usage go?" tone="report">
      <div className="p-4 sm:p-6">
        <figure className="flex flex-col gap-2 rounded-lg border border-white/10 p-4">
          <figcaption className="flex items-center gap-3">
            <span className="font-display text-[32px] leading-none font-bold text-accent">{weeklyShare.at(-1)?.percent}%</span>
            <div>
              <h4 className="text-sm font-semibold text-neutral-50">Long-session share</h4>
              <p className="text-xs text-neutral-400">of Claude Code and Codex usage in the last 4 weeks</p>
            </div>
          </figcaption>
          <div className="grid h-24 grid-cols-[2rem_minmax(0,1fr)] gap-2">
            <div className="flex flex-col justify-between text-xs text-neutral-400" aria-hidden="true">
              <span>70%</span>
              <span>0%</span>
            </div>
            <ul aria-label="Weekly long-session share" className="flex items-end gap-1 border-b border-white/15 sm:gap-2">
              {weeklyShare.map(({ date, percent }) => (
                <li
                  key={date}
                  className="min-w-0 flex-1 rounded-t-sm bg-accent/45 nth-last-[-n+4]:bg-accent"
                  style={{ height: `${percent / 70 * 100}%` }}
                  title={`Week of ${date}: ${percent}%`}
                >
                  <span className="sr-only">Week of {date}: {percent}%</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between gap-1 text-xs text-neutral-400" aria-hidden="true">
            {weeklyShare.filter(({ tick }) => tick).map(({ date }) => <span key={date}>{date}</span>)}
          </div>
        </figure>
      </div>
    </ReportExcerpt>
  );
}

function SkillsExample() {
  return (
    <ReportExcerpt title="Skills to fix" description="3 of 7 skills you wrote give wrong information">
      <ul className="px-4 py-3 sm:px-6">
        {skillFindings.map(({ name, issue, anchor, action }, index) => (
          <li key={name} className="border-b border-rule py-3 last:border-b-0">
            <div className="flex flex-wrap items-center justify-between gap-x-4">
              <div>
                <h4 className="text-sm font-semibold text-ink">{name}</h4>
                <p className="text-sm text-text-3">{issue}</p>
              </div>
              <a
                href={`${links.sampleReport}#${anchor}`}
                aria-label={`${action} for ${name} in the sample report`}
                className="inline-flex min-h-11 items-center text-sm text-accent underline-offset-4 hover:underline"
              >
                {action}
              </a>
            </div>
            {index === 0 && (
              <div className="mt-2 flex items-center gap-4 rounded-md bg-surface p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Paste into a new Claude Code session</p>
                  <p className="mt-1 text-sm text-text-3">Update the tool table in the sample pr-review skill.</p>
                </div>
                <CopyButton text={skillPrompt} label="Copy the sample pr-review fix" />
              </div>
            )}
          </li>
        ))}
      </ul>
    </ReportExcerpt>
  );
}

export function Approach() {
  return (
    <>
      <FeatureSection
        id="approach"
        kicker="Habits & usage"
        title="Long sessions drift and eat your usage."
        description="Chats keep growing as you move from one task to the next. Second Look shows how much of your Claude Code and Codex usage goes to very long sessions, and when starting fresh could help."
      >
        <UsageExample />
      </FeatureSection>
      <FeatureSection
        id="skills"
        kicker="Skills"
        title="Three of your seven skills give wrong information."
        description="Skills go stale when nobody checks them. Second Look reviews the skill instructions it can read, flags stale information it finds, and suggests fixes."
      >
        <SkillsExample />
      </FeatureSection>
    </>
  );
}
