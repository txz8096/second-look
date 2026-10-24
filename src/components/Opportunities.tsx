import { Container, Kicker, SectionHeading } from "./ui";

const benefits = [
  { title: "Less overhead", body: "Cut the setup and re-explaining around each task." },
  { title: "Fewer errors", body: "Find the habit behind repeated rework." },
  { title: "Better code help", body: "Ask for code with a clear scope and a way to check it." },
  { title: "Less retyping", body: "Move repeated context into memory and skills." },
  { title: "Your own judgment", body: "See where you hand off thinking that should stay yours." },
  { title: "Deeper research", body: "Learn what made your best sessions go further." },
  { title: "Habits that transfer", body: "Turn one-off wins into habits across tools and models." },
  { title: "The right tool", body: "Match each task to the assistant that suits it." },
];

export function Opportunities() {
  return (
    <section id="opportunities" className="scroll-mt-4 border-t border-rule bg-paper">
      <Container className="flex flex-col gap-16 py-20 lg:py-28">
        <div className="flex max-w-[760px] flex-col gap-5">
          <Kicker>The opportunities</Kicker>
          <SectionHeading>Where a closer look pays off.</SectionHeading>
        </div>
        <ol className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-16">
          {benefits.map((b, i) => (
            <li key={b.title} className="flex flex-col gap-3.5 border-t-2 border-accent pt-6">
              <span className="font-mono text-[13px] text-text-3">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-xl leading-[1.2] font-bold text-ink">{b.title}</h3>
              <p className="font-body text-sm leading-[1.55] text-text-2">{b.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
