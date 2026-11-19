import type { CSSProperties } from "react";
import { Container, SectionHeading } from "./ui";

const behaviors = [
  { emoji: "📝", label: "Prompts", description: "Find missing details in your prompts." },
  { emoji: "⚙️", label: "Setup", description: "Check your system instructions and memory for gaps." },
  { emoji: "🛠️", label: "Skills", description: "Find skill instructions that need updating." },
  { emoji: "🌱", label: "Habits", description: "See how your work habits have changed and what to try next." },
];

export function Approach() {
  return (
    <section id="approach" className="bg-paper">
      <Container className="flex flex-col gap-8 py-[72px]">
        <div data-reveal>
          <SectionHeading size="small">What the review covers</SectionHeading>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
          {behaviors.map((behavior, i) => (
            <li
              key={behavior.label}
              className="flex flex-col gap-3 border-b border-rule pb-6 last:border-b-0 last:pb-0 lg:border-r lg:border-b-0 lg:pr-6 lg:pb-0 lg:last:border-r-0"
              data-reveal
              style={{ "--reveal-delay": `${i * 80}ms` } as CSSProperties}
            >
              <h3 className="flex items-center gap-2.5 font-display text-[22px] leading-tight font-semibold tracking-[-0.4px] text-ink">
                <span aria-hidden="true" className="text-2xl tracking-normal">{behavior.emoji}</span>
                {behavior.label}
              </h3>
              <p className="font-body text-base leading-[1.55] text-text-2">{behavior.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
