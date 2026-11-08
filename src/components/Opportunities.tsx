import { ArrowRight } from "lucide-react";
import { links } from "@/lib/site";
import { Container, SectionHeading } from "./ui";

const benefits = [
  { title: "I’ve explained this before.", body: "You repeat the same instructions or corrections whenever a task comes up." },
  { title: "What should I hand off?", body: "You’re unsure what AI should do and what you need to check." },
  { title: "Where did all that usage go?", body: "Your chats keep growing as you move from one task to the next." },
  { title: "Are my skills still current?", body: "You haven’t checked their instructions or updates lately." },
];

export function Opportunities() {
  return (
    <section id="opportunities" className="border-t border-rule bg-paper">
      <Container className="grid gap-10 py-16 lg:grid-cols-[440px_1fr] lg:gap-20">
        <div className="flex flex-col items-start gap-6">
          <SectionHeading size="compact">Spend less time on the same AI problems</SectionHeading>
          <p className="font-body text-lg leading-[1.55] text-text-2">Use AI for recurring work? See if any of these sound familiar.</p>
          <a href={links.sampleReport} className="inline-flex min-h-11 items-center gap-2 font-body text-base text-accent underline-offset-4 hover:underline">
            See a sample report <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
        <ul className="min-w-0 border-t border-rule">
          {benefits.map((benefit) => (
            <li key={benefit.title} className="flex flex-col gap-2 border-b border-rule py-5 last:border-b-0">
              <h3 className="font-display text-[26px] leading-[1.2] font-semibold tracking-[-0.5px] text-ink">{benefit.title}</h3>
              <p className="font-body text-lg leading-normal text-text-2">{benefit.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
