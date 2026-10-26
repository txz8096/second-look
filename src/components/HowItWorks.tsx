import { ClipboardList, RotateCcw, TrendingUp, Wrench, type LucideIcon } from "lucide-react";
import { Container, Kicker, SectionHeading } from "./ui";

const steps: { title: string; desc: string; icon: LucideIcon }[] = [
  { title: "Coach this cycle", desc: "Pick a few patterns to test. The rest waits.", icon: ClipboardList },
  { title: "Maintain your AI setup", desc: "Flag stale, broken or duplicate skills and config.", icon: Wrench },
  { title: "Review change over time", desc: "Compare habits and outcomes across tools.", icon: TrendingUp },
  { title: "Return to the evidence", desc: "Did it stick, did it help, and what did it cost?", icon: RotateCcw },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-rule bg-paper">
      <Container className="flex flex-col gap-16 py-20 lg:py-28">
        <div className="flex max-w-[720px] flex-col gap-5">
          <Kicker>Every two weeks</Kicker>
          <SectionHeading>Review, plan, check back.</SectionHeading>
          <p className="font-body text-[17px] leading-[1.55] text-text-2">
            Reviews run when you ask. If you like, a reminder on your computer nudges you every two weeks, and you can
            change the timing or turn it off by asking your assistant.
          </p>
        </div>
        <ol className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-4 border-t-2 border-accent pt-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[13px] text-accent">{String(i + 1).padStart(2, "0")}</span>
                <step.icon size={20} className="text-text-3" aria-hidden="true" />
              </div>
              <h3 className="font-display text-[26px] leading-[1.2] font-bold tracking-[-0.65px] text-ink">
                {step.title}
              </h3>
              <p className="font-body text-[15px] leading-[1.55] text-text-2">{step.desc}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
