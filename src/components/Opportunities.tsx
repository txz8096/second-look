import { Container, Kicker, SectionHeading } from "./ui";

const benefits = [
  { title: "Less overhead for tasks", body: "Cut the setup and long-session overhead around each task, so work moves faster and your usage goes further." },
  { title: "Better output, fewer errors", body: "Find the habits behind rework, so first results need less fixing." },
  { title: "More reliable code", body: "Ask for code with a clear scope and a way to check it." },
  { title: "Keep your own judgement", body: "Depend less on AI for the thinking." },
  { title: "Deeper research", body: "Get more thorough research and sharper reasoning from each session." },
  { title: "Skills that transfer", body: "Build skills that carry over to new tools and models." },
  { title: "Bring tools together", body: "Get more from several AI tools by matching each task to the right one." },
  { title: "Less repeated setup", body: "Stop retyping context. Move it into memory and skills." },
];

export function Opportunities() {
  return (
    <section id="opportunities" className="border-t border-rule bg-paper">
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
