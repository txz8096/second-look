import { links } from "@/lib/site";
import { GithubIcon } from "./Icons";
import { Container, Kicker, PrimaryButton, SectionHeading } from "./ui";

const steps = [
  {
    title: "Install in Claude Code",
    prereq: "Adds the second look marketplace, then installs the plugin.",
    commands: [
      "claude plugin marketplace add txz8096/second-look",
      "claude plugin install second-look@second-look",
    ],
  },
  {
    title: "Or install for Codex and Cursor",
    prereq: "Copies the skill to ~/.agents/skills, which both tools read. Needs git and Python 3.",
    commands: ["curl -fsSL https://raw.githubusercontent.com/txz8096/second-look/main/install.sh | bash"],
  },
  {
    title: "Ask for a reflection",
    prereq: "In any of those tools. The first run asks four setup questions.",
    commands: ["reflect on how I've been using AI"],
  },
];

const secondaryLinks = [
  { label: "Sample report", href: "#sample-report" },
  { label: "Supported tools", href: links.supportedTools },
  { label: "Contributing", href: links.contributing },
  { label: "Report an issue", href: links.issues },
];

export function Install() {
  return (
    <section id="install" className="scroll-mt-4 bg-paper">
      <Container className="flex flex-col gap-14 py-20 lg:flex-row lg:gap-24 lg:py-28">
        <div className="flex flex-col items-start gap-6 lg:w-[460px] lg:shrink-0">
          <Kicker>Getting started</Kicker>
          <SectionHeading>Try it on your own conversations.</SectionHeading>
          <p className="font-body text-[17px] leading-[1.55] text-text-2">See GitHub for supported tools and setup.</p>
          <PrimaryButton href={links.github} className="gap-2.5">
            <GithubIcon size={18} />
            Get Second Look on GitHub
          </PrimaryButton>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {secondaryLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="font-body text-sm text-accent underline-offset-4 hover:underline">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-4">
          <ol className="flex flex-col gap-4">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="flex flex-col gap-3.5 rounded-[10px] bg-surface p-6 outline outline-1 -outline-offset-1 outline-rule"
              >
                <div className="flex items-center gap-3.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-ink font-mono text-[13px] text-ink">
                    {i + 1}
                  </span>
                  <h3 className="font-body text-lg font-semibold text-ink">{step.title}</h3>
                </div>
                <p className="font-body text-sm leading-[1.55] text-text-3">{step.prereq}</p>
                {step.commands.map((command) => (
                  <div key={command} className="flex items-center gap-3 overflow-x-auto rounded-md bg-dark px-4 py-3.5">
                    <span className="font-code text-sm text-text-3 select-none">{i === 2 ? ">" : "$"}</span>
                    <code className="flex-1 font-code text-sm whitespace-nowrap text-code">{command}</code>
                  </div>
                ))}
              </li>
            ))}
          </ol>
          <p className="font-body text-sm leading-[1.55] text-text-3">
            Your sessions stay on your computer. Reports quote your own prompts, with secrets removed.
          </p>
        </div>
      </Container>
    </section>
  );
}
