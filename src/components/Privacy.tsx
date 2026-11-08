import { ArrowUpRight } from "lucide-react";
import { links } from "@/lib/site";
import { Container, SectionHeading } from "./ui";

export function Privacy() {
  return (
    <section id="privacy" className="border-t border-rule bg-paper">
      <Container className="flex flex-col gap-6 py-16">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <SectionHeading size="compact">No server. No account.</SectionHeading>
          <a href={`${links.github}#privacy`} className="inline-flex min-h-11 items-center gap-2 font-body text-base text-accent underline-offset-4 hover:underline">
            Privacy details on GitHub <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
        <p className="font-body text-xl leading-normal text-accent">Nothing about your sessions is sent to us.</p>
        <p className="font-body text-lg leading-[1.55] text-text-2">
          Second Look runs inside your assistant and saves the report on your computer. Your model provider sees what the review reads, under your existing settings.
        </p>
      </Container>
    </section>
  );
}
