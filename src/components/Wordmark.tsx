import { WORDMARK_DOUBLE_RULE, WORDMARK_LETTERS, WORDMARK_VIEWBOX } from "@/lib/paths";

export function Wordmark({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      className={className}
      role="img"
      aria-label="Second Look"
    >
      <path d={WORDMARK_LETTERS} className="fill-ink" />
      <path d={WORDMARK_DOUBLE_RULE} className="fill-accent" />
    </svg>
  );
}
