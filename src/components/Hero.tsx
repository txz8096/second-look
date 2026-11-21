import Image from "next/image";
import type { CSSProperties } from "react";
import { links } from "@/lib/site";
import { GithubIcon } from "./Icons";
import { Container, Kicker, PrimaryButton, SecondaryButton } from "./ui";

const sampleFindings = [
  { value: "27", label: "times the same rules were retyped in 4 weeks" },
  { value: "61%", label: "of Claude Code and Codex usage went to 14 very long sessions" },
  { value: "3 of 7", label: "skills gave wrong information" },
];

export function Hero() {
  return (
    <section id="top" className="overflow-x-clip bg-paper">
      <Container className="grid gap-10 py-16 xl:grid-cols-[480px_minmax(0,1fr)] xl:items-start xl:gap-16">
        <div className="flex flex-col gap-5">
          <div className="hero-in flex flex-wrap items-center gap-3" style={{ "--hero-delay": "0ms" } as CSSProperties}>
            <Kicker>Free reflection skill</Kicker>
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 font-body text-xs leading-4 font-medium whitespace-nowrap text-accent">
              Early access
            </span>
          </div>
          <h1 className="hero-in font-display text-[40px] leading-[1.04] font-bold tracking-[-1.4px] text-ink md:text-[44px] md:tracking-[-1.5px]" style={{ "--hero-delay": "80ms" } as CSSProperties}>
            Performance review for your AI workflow
          </h1>
          <p className="hero-in pt-1 font-body text-base leading-[1.55] text-text-2" style={{ "--hero-delay": "160ms" } as CSSProperties}>
            Second Look reviews your AI sessions across your apps, finds recurring patterns, and makes recommendations to try.
            <span className="block">For example, from the sample report:</span>
          </p>
          <ul className="hero-in border-t border-rule" style={{ "--hero-delay": "240ms" } as CSSProperties}>
            {sampleFindings.map(({ value, label }) => (
              <li key={value} className="flex items-baseline gap-4 border-b border-rule py-3 last:border-b-0">
                <span className="w-20 shrink-0 font-display text-[28px] leading-[1.2] font-bold tracking-tight text-accent sm:w-24">{value}</span>
                <span className="text-base text-text-2">{label}</span>
              </li>
            ))}
          </ul>
          <div className="hero-in flex flex-wrap items-center gap-3 pt-3" style={{ "--hero-delay": "320ms" } as CSSProperties}>
            <PrimaryButton href={links.sampleReport}>
              Sample report
            </PrimaryButton>
            <SecondaryButton href={links.github}>
              <GithubIcon size={18} />
              Get the skill
            </SecondaryButton>
          </div>
        </div>
        <div className="hero-stage xl:h-[600px]">
          <a
            href={links.sampleReport}
            className="hero-shot block aspect-[15/7] overflow-hidden rounded-xl border border-rule mask-b-from-55% mask-b-to-95% xl:aspect-auto xl:h-[560px] xl:w-[1200px]"
            aria-label="Open the sample Second Look report"
          >
            <Image
              src={links.reportPreview}
              alt="A sample Second Look review of made-up sessions, with a chart of what you use AI for"
              width={1440}
              height={672}
              loading="eager"
              fetchPriority="high"
              unoptimized
              className="block h-auto w-full"
            />
          </a>
        </div>
      </Container>
    </section>
  );
}
