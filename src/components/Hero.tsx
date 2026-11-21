import Image from "next/image";
import type { CSSProperties } from "react";
import { links } from "@/lib/site";
import { GithubIcon } from "./Icons";
import { Container, PrimaryButton, SecondaryButton } from "./ui";

export function Hero() {
  return (
    <section id="top" className="overflow-x-clip bg-paper">
      <Container className="grid gap-10 py-16 xl:grid-cols-[400px_minmax(0,1fr)] xl:items-center xl:gap-12">
        <div className="flex flex-col gap-5">
          <h1 className="hero-in font-display text-[40px] leading-[1.04] font-bold tracking-[-1.4px] text-ink" style={{ "--hero-delay": "0ms" } as CSSProperties}>
            Find what slows down your AI workflow
          </h1>
          <p className="hero-in pt-1 font-body text-base leading-[1.55] text-text-2" style={{ "--hero-delay": "80ms" } as CSSProperties}>
            Second Look reviews your AI sessions across your apps, finds recurring patterns, and makes recommendations to try.
          </p>
          <div className="hero-in flex flex-wrap items-center gap-3 pt-3" style={{ "--hero-delay": "160ms" } as CSSProperties}>
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
