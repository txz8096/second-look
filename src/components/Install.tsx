import { links } from "@/lib/site";
import type { ReactNode } from "react";
import { CopyButton } from "./CopyButton";
import { GithubIcon } from "./Icons";
import { Container, Kicker, PrimaryButton, SectionHeading } from "./ui";

const INSTALL_PROMPT = "Install second look from github.com/txz8096/second-look.";
const INSTALL_COMMAND = "curl -fsSL https://raw.githubusercontent.com/txz8096/second-look/main/install.sh | bash";

const secondaryLinks = [
  { label: "Sample report", href: "#sample-report" },
  { label: "Report an issue", href: links.issues },
];

function Step({ n, title, prereq, children }: { n: number; title: string; prereq: string; children: ReactNode }) {
  return (
    <li className="flex flex-col gap-3.5 rounded-[10px] bg-surface p-6 outline outline-1 -outline-offset-1 outline-rule">
      <div className="flex items-center gap-3.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-ink font-mono text-[13px] text-ink">
          {n}
        </span>
        <h3 className="font-body text-lg font-semibold text-ink">{title}</h3>
      </div>
      <p className="font-body text-sm leading-[1.55] text-text-3">{prereq}</p>
      {children}
    </li>
  );
}

function CodeBlock({ prompt, text, copy }: { prompt: string; text: string; copy?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md bg-dark px-4 py-3.5">
      <span className="font-code text-sm leading-[1.55] text-text-3 select-none">{prompt}</span>
      <code className="min-w-0 flex-1 font-code text-sm leading-[1.55] break-words text-code">{text}</code>
      {copy && <CopyButton text={copy} label={`Copy ${copy}`} />}
    </div>
  );
}

export function Install() {
  return (
    <section id="install" className="bg-paper">
      <Container className="flex flex-col gap-14 py-20 lg:flex-row lg:gap-24 lg:py-28">
        <div className="flex flex-col items-start gap-6 lg:w-[460px] lg:shrink-0">
          <Kicker>Getting started</Kicker>
          <SectionHeading>Try it on your own conversations.</SectionHeading>
          <p className="font-body text-[17px] leading-[1.55] text-text-2">
            One install covers Claude Code, Codex and Cursor. Everything is read on your computer, and nothing is
            uploaded.
          </p>
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
            <Step
              n={1}
              title="Ask your assistant to install it"
              prereq="Paste this into Claude Code, Codex, or Cursor. It tells you which folders it will read before it changes anything."
            >
              <CodeBlock prompt="›" text={INSTALL_PROMPT} copy={INSTALL_PROMPT} />
              <div className="flex flex-col gap-1.5">
                <p className="font-body text-sm text-text-3">Prefer the terminal?</p>
                <div className="flex items-start gap-3">
                  <code className="min-w-0 flex-1 font-code text-[13px] leading-[1.55] break-all text-text-2">
                    {INSTALL_COMMAND}
                  </code>
                  <CopyButton text={INSTALL_COMMAND} label="Copy the terminal command" compact />
                </div>
              </div>
            </Step>
            <Step
              n={2}
              title="Add your claude.ai and ChatGPT history"
              prereq="Optional, and you can add it any time. In claude.ai, go to Settings → Privacy → Export data. In ChatGPT, go to Settings → Data controls → Export data. Each emails you a zip, usually within a day. Put its conversations.json here:"
            >
              <CodeBlock prompt="→" text="~/.second-look/exports/claude  or  /chatgpt" />
            </Step>
            <Step
              n={3}
              title="Ask for a second look"
              prereq="Ask your assistant for a second look, or type /second-look in Claude Code. The first run asks four questions, then builds a private report you can check and correct."
            >
              <CodeBlock prompt="›" text="/second-look" copy="/second-look" />
            </Step>
          </ol>
          <p className="font-body text-sm leading-[1.55] text-text-3">
            Claude Code only? Install the plugin instead:{" "}
            <code className="font-code text-[13px] text-text-2">/plugin marketplace add txz8096/second-look</code>, then{" "}
            <code className="font-code text-[13px] text-text-2">/plugin install second-look@second-look</code>. On
            claude.ai? Download{" "}
            <a
              href={`${links.github}/releases/latest/download/second-look.zip`}
              className="text-accent underline-offset-4 hover:underline"
            >
              second-look.zip
            </a>
            , turn on code execution in Settings → Capabilities, and upload it under Skills.
          </p>
        </div>
      </Container>
    </section>
  );
}
