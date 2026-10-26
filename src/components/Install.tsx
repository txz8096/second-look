import { links } from "@/lib/site";
import { GithubIcon } from "./Icons";
import { Container, Kicker, PrimaryButton, SectionHeading } from "./ui";

const steps = [
  {
    title: "Install the skill",
    prereq: "Requires a compatible AI coding assistant. [List to confirm]",
    command: "git clone https://github.com/[org]/second-look",
  },
  {
    title: "Select or provide your data",
    prereq: "Point it at the conversations to read.",
    command: "second-look --source [path-or-tool]",
  },
  {
    title: "Run the reflection",
    prereq: "Get a report you can check and correct.",
    command: "second-look report",
  },
];

const secondaryLinks = [
  { label: "Sample report", href: "#sample-report" },
  { label: "Report an issue", href: links.issues },
];

export function Install() {
  return (
    <section id="install" className="bg-paper">
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
                <div className="flex items-center gap-3 overflow-x-auto rounded-md bg-dark px-4 py-3.5">
                  <span className="font-code text-sm text-text-3 select-none">$</span>
                  <code className="flex-1 font-code text-sm whitespace-nowrap text-code">{step.command}</code>
                  <span className="shrink-0 font-mono text-xs text-warning">Untested</span>
                </div>
              </li>
            ))}
          </ol>
          <p className="font-body text-sm leading-[1.55] text-text-3">
            Placeholder commands. Copy buttons appear once tested.
          </p>
        </div>
      </Container>
    </section>
  );
}
