import { Container, SectionHeading } from "./ui";

const behaviors = [
  { emoji: "📝", label: "Prompts", description: "Find missing details in your prompts." },
  { emoji: "⚙️", label: "Setup", description: "Check your system instructions and memory for gaps." },
  { emoji: "🛠️", label: "Skills", description: "Find skill instructions that need updating." },
  { emoji: "🌱", label: "Habits", description: "See how your work habits have changed and what to try next." },
];

export function Approach() {
  return (
    <section id="approach" className="border-t border-rule bg-surface">
      <Container className="flex flex-col gap-8 py-16">
        <SectionHeading size="compact">What the review covers</SectionHeading>
        <ul className="grid gap-6 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
          {behaviors.map((behavior) => (
            <li key={behavior.label} className="flex flex-col gap-3 border-b border-rule pb-6 last:border-b-0 last:pb-0 sm:border-r sm:border-b-0 sm:pr-6 sm:pb-0 sm:last:border-r-0">
              <h3 className="flex items-center gap-2.5 font-display text-2xl leading-tight font-semibold text-ink">
                <span aria-hidden="true">{behavior.emoji}</span>{behavior.label}
              </h3>
              <p className="font-body text-lg leading-[1.55] text-text-2">{behavior.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
