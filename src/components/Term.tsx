"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

// Same definitions the report shows on its habit terms.
const definitions = {
  sessions:
    "Conversations you had with an AI tool this cycle, across every tool Second Look read. Shown for context: the count alone says nothing about how well they went.",
  briefedStarts:
    "Your first message gives at least two of three things: the goal, the context, and what done looks like.",
  corrections:
    "Messages that fix a misunderstanding, like “no, I meant…” or “that’s not what I asked”. Counted per 10 messages you send, so busy and quiet weeks compare fairly.",
  outputChecking:
    "In build and research sessions, the share where you asked for sources, edge cases or a critique before accepting the result.",
  restarts:
    "A new session that opens with mostly the same request as one from the last two days, in the same tool. It usually means the first try went off track.",
  rulesRetyped:
    "A standing preference typed by hand, like “use tables” or “no filler”. If you type it more than once, it belongs in your CLAUDE.md, AGENTS.md or Cursor rules.",
};

const CARD_MAX_WIDTH = 280;
const EDGE = 16;

// A habit term with a dashed underline that opens its definition on hover, tap or focus. Escape closes it.
export type TermName = keyof typeof definitions;

export function Term({ name, children }: { name: TermName; children: ReactNode }) {
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Starts the card under the term, then slides it left as far as needed to keep it on screen.
  const open = () => {
    setDismissed(false);
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    // clientWidth, unlike innerWidth, stays at the screen's width on phones when content overflows.
    const viewport = document.documentElement.clientWidth;
    const cardWidth = Math.min(CARD_MAX_WIDTH, viewport - 2 * EDGE);
    const left = Math.max(EDGE, Math.min(rect.left, viewport - EDGE - cardWidth));
    setOffset(left - rect.left);
  };

  useEffect(() => {
    if (!hovered) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDismissed(true);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hovered]);

  return (
    <span
      ref={ref}
      tabIndex={0}
      aria-describedby={id}
      onPointerEnter={() => {
        setHovered(true);
        open();
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={open}
      onKeyDown={(e) => e.key === "Escape" && setDismissed(true)}
      className="group relative inline-block cursor-help rounded-sm underline decoration-text-3 decoration-dashed decoration-1 underline-offset-4 hover:decoration-accent focus-visible:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {children}
      <span
        id={id}
        role="tooltip"
        style={{ left: offset }}
        className={`absolute top-full z-50 mt-2 hidden w-max max-w-[min(280px,calc(100vw-32px))] rounded-md bg-ink px-3 py-2.5 text-left font-body text-[13px] leading-[1.45] font-normal tracking-normal whitespace-normal normal-case text-paper shadow-[0_6px_18px_rgb(0_0_0/0.3)] before:absolute before:inset-x-0 before:-top-2 before:h-2 ${dismissed ? "" : "group-hover:block group-focus:block"}`}
      >
        {definitions[name]}
      </span>
    </span>
  );
}
