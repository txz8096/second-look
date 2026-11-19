import { Container, Kicker, SectionHeading } from "./ui";

const behaviors = [
  { emoji: "📝", label: "Your briefs", description: "Where clearer context could save a restart." },
  { emoji: "⚙️", label: "Your setup", description: "Check system instructions and memory for gaps." },
  { emoji: "🧰", label: "Your skills", description: "Instructions and updates worth checking." },
  { emoji: "🌱", label: "Your habits", description: "What changed, and what to try next." },
];

export function Approach() {
  return (
    <section id="approach" className="border-t border-rule bg-surface">
      <Container className="flex flex-col gap-7 py-12">
        <Kicker>Our approach</Kicker>
        <SectionHeading size="compact">A review you can act on</SectionHeading>
        <ul className="grid gap-6 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
          {behaviors.map((behavior) => (
            <li key={behavior.label} className="flex flex-col gap-3 border-b border-rule pb-6 last:border-b-0 last:pb-0 lg:border-r lg:border-b-0 lg:pr-6 lg:pb-0 lg:last:border-r-0">
              <span aria-hidden="true" className="text-4xl leading-normal">{behavior.emoji}</span>
              <h3 className="font-display text-2xl leading-tight font-semibold text-ink">{behavior.label}</h3>
              <p className="font-body text-lg leading-[1.55] text-text-2">{behavior.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
