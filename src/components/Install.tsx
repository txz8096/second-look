import { links } from "@/lib/site";
import type { ReactNode } from "react";
import { CopyButton } from "./CopyButton";
import { GithubIcon } from "./Icons";
import { Container, PrimaryButton, SectionHeading } from "./ui";

const INSTALL_PROMPT = "Install Second Look from github.com/txz8096/second-look.";
const REVIEW_PROMPT = "Give me a Second Look.";

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex flex-col gap-4 border-b border-rule pb-7 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-rule font-body text-sm text-accent">{n}</span>
        <h3 className="font-body text-xl font-semibold text-ink">{title}</h3>
      </div>
      {children}
    </li>
  );
}

function CodeBlock({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-4 rounded-md border border-rule bg-dark p-5">
      <code className="min-w-0 flex-1 font-code text-sm leading-[1.55] break-words text-ink">{text}</code>
      <CopyButton text={text} label={`Copy ${text}`} compact />
    </div>
  );
}

export function Install() {
  return (
    <section id="install" className="border-t border-rule bg-surface">
      <Container className="grid gap-10 py-16 lg:grid-cols-[440px_1fr] lg:gap-20">
        <div className="flex flex-col items-start gap-6">
          <SectionHeading size="compact">Try it on your own conversations.</SectionHeading>
          <p className="font-body text-lg leading-[1.55] text-text-2">Start from Claude Code, Codex or Cursor.</p>
          <PrimaryButton href={links.github} className="gap-2.5">
            <GithubIcon size={18} />
            Get the skill
          </PrimaryButton>
        </div>
        <ol className="flex min-w-0 flex-col gap-7">
          <Step n={1} title="Ask your assistant to install it">
            <CodeBlock text={INSTALL_PROMPT} />
          </Step>
          <Step n={2} title="Ask for a Second Look">
            <CodeBlock text={REVIEW_PROMPT} />
            <p className="font-body text-base leading-normal text-text-2">The first run asks four short questions, then builds your report.</p>
          </Step>
        </ol>
      </Container>
    </section>
  );
}
