import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { links } from "@/lib/site";
import { Container, PrimaryButton, SectionHeading } from "./ui";

const benefits = [
  { title: "I’ve explained this before.", body: "You repeat the same instructions or corrections whenever a task comes up." },
  { title: "What should I hand off?", body: "You’re unsure what AI should do and what you need to check." },
  { title: "Where did all that usage go?", body: "Your sessions keep growing as you move from one task to the next." },
  { title: "Are my skills still current?", body: "You haven’t checked their instructions or updates lately." },
];

export function Opportunities() {
  return (
    <section id="opportunities" className="bg-paper">
      <Container className="grid gap-10 py-[68px] lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-20">
        <div className="flex flex-col items-start gap-6" data-reveal>
          <SectionHeading>
            Spend less time<br className="hidden lg:block" />{" "}
            on the same<br className="hidden lg:block" />{" "}
            problems
          </SectionHeading>
          <p className="font-body text-lg leading-[1.55] text-text-2">Use AI for recurring work? See if any of these sound familiar.</p>
          <PrimaryButton href={links.sampleReport} className="py-4">
            Sample report <ArrowRight size={18} aria-hidden="true" />
          </PrimaryButton>
        </div>
        <ul className="min-w-0">
          {benefits.map((benefit, i) => (
            <li
              key={benefit.title}
              className="flex flex-col gap-2 border-b border-rule py-5 first:pt-0 last:border-b-0"
              data-reveal
              style={{ "--reveal-delay": `${i * 80}ms` } as CSSProperties}
            >
              <h3 className="font-display text-2xl leading-[1.2] font-semibold tracking-[-0.5px] text-ink">{benefit.title}</h3>
              <p className="font-body text-lg leading-normal text-text-2">{benefit.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
