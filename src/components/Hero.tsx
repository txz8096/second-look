import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { links } from "@/lib/site";
import { GithubIcon } from "./Icons";
import { Container, Kicker, PrimaryButton, SecondaryButton } from "./ui";

export function Hero() {
  return (
    <section id="top" className="bg-paper">
      <Container className="flex flex-col gap-10 py-16">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,680fr)_minmax(0,456fr)] lg:items-start lg:gap-16">
          <div className="flex flex-col gap-5">
            <Kicker>Open-source reflection skill</Kicker>
            <h1 className="font-display text-[44px] leading-[1.04] font-bold tracking-[-1.6px] text-ink md:text-[56px]">
              Performance review{" "}
              <br className="hidden lg:block" />
              for your AI workflow.
            </h1>
          </div>
          <div className="flex min-w-0 flex-col gap-6 lg:pt-10">
            <p className="font-body text-xl leading-[1.55] text-text-2">
              Second Look reviews your AI conversations across your apps, finds recurring problems, and recommends fixes to try.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <PrimaryButton href={links.sampleReport} className="group">
                See a sample report
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:translate-x-0.5"
                />
              </PrimaryButton>
              <SecondaryButton href={links.github} className="border-rule">
                <GithubIcon size={18} />
                Get the skill
              </SecondaryButton>
            </div>
          </div>
        </div>
        <figure className="flex flex-col gap-3">
          <a href={links.sampleReport} className="block aspect-[15/7] overflow-hidden rounded-xl border border-rule" aria-label="Open the sample Second Look report">
            <Image
              src={links.reportPreview}
              alt="A sample Second Look review with a session-usage chart"
              width={1440}
              height={1000}
              loading="eager"
              fetchPriority="high"
              unoptimized
              className="block h-auto w-full"
            />
          </a>
          <figcaption className="font-body text-sm leading-normal text-text-3">From the sample report · Made-up sessions</figcaption>
        </figure>
      </Container>
    </section>
  );
}
