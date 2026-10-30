"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Container, Kicker, SectionHeading } from "./ui";

type Behavior = {
  label: string;
  question: string;
  example?: { tag: string; text: string }[];
};

const behaviors: Behavior[] = [
  {
    label: "Improve your prompts and context",
    question: "Did the first message give the goal, audience, constraints and what done looks like?",
    example: [
      { tag: "PATTERN", text: "Your prototype requests name the feature, not the user." },
      { tag: "EVIDENCE", text: "In three examples, that cost several turns of clarifying." },
      { tag: "CHANGE TO TRY", text: "Add who it’s for and what done means to the first message." },
    ],
  },
  {
    label: "Keep your skills current",
    question: "Which skills or configs are stale, broken, duplicated, or loading into every session unused?",
  },
  {
    label: "See how your habits change",
    question: "Did your changes stick, did the work improve, and where did your usage go?",
  },
];

function SmallLabel({ children }: { children: string }) {
  return <p className="font-mono text-xs tracking-[0.8px] text-accent">{children}</p>;
}

export function Approach() {
  const [open, setOpen] = useState(0);

  return (
    <section id="approach" className="border-t border-rule bg-paper">
      <Container className="flex flex-col gap-14 py-20 lg:flex-row lg:gap-24 lg:py-28">
        <div className="flex flex-col gap-6 lg:w-[440px] lg:shrink-0">
          <Kicker>Our approach</Kicker>
          <SectionHeading>AI use is more than the prompt you type.</SectionHeading>
          <p className="font-body text-[17px] leading-[1.55] text-text-2">
            It also reads the context you give, your skills and config, and how your habits change. Each
            finding shows its evidence and one small change to try.
          </p>
          <p className="font-body text-[15px] leading-[1.55] text-text-3">
            Sources it can’t open are marked “not checked.”
          </p>
        </div>

        <div className="w-full border-t border-ink">
          {behaviors.map((b, i) => {
            const isOpen = open === i;
            const panelId = `behavior-panel-${i}`;
            return (
              <div key={b.label} className="flex flex-col gap-5 border-b border-rule py-7">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="group flex w-full items-center gap-6 text-left"
                  >
                    <span className={`w-5 shrink-0 font-mono text-[13px] ${isOpen ? "text-accent" : "text-text-3"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`flex-1 font-display text-[22px] font-bold tracking-[-0.6px] transition-colors md:text-[28px] ${
                        isOpen ? "text-ink" : "text-text-2 group-hover:text-ink"
                      }`}
                    >
                      {b.label}
                    </span>
                    {isOpen ? (
                      <Minus size={22} className="shrink-0 text-accent" aria-hidden="true" />
                    ) : (
                      <Plus size={22} className="shrink-0 text-text-3" aria-hidden="true" />
                    )}
                  </button>
                </h3>

                <div id={panelId} className="pl-11">
                  {isOpen ? (
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-2.5">
                        <SmallLabel>WHAT THE SKILL LOOKS FOR</SmallLabel>
                        <p className="font-body text-lg leading-normal text-ink md:text-xl">{b.question}</p>
                      </div>
                      {b.example && (
                        <div className="flex flex-col gap-3.5 border-t border-rule pt-5">
                          <SmallLabel>WHAT YOU GET BACK</SmallLabel>
                          <dl className="flex flex-col gap-3.5">
                            {b.example.map((row) => (
                              <div
                                key={row.tag}
                                className="flex flex-col gap-1 border-l-2 border-accent py-0.5 pl-3.5 sm:flex-row sm:gap-5"
                              >
                                <dt className="font-mono text-xs leading-[1.9] tracking-[0.8px] text-accent sm:w-[104px] sm:shrink-0">
                                  {row.tag}
                                </dt>
                                <dd className="font-display text-[17px] leading-[1.35] font-bold tracking-[-0.3px] text-ink">
                                  {row.text}
                                </dd>
                              </div>
                            ))}
                          </dl>
                          <p className="font-body text-[15px] leading-[1.55] text-text-3">
                            Generic advice like “write clearer prompts” doesn’t make the cut.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="font-body text-[15px] leading-[1.55] text-text-3">{b.question}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
