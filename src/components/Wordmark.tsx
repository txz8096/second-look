import { WORDMARK_DOUBLE_RULE, WORDMARK_LETTERS, WORDMARK_VIEWBOX } from "@/lib/paths";

// `stretch` fills the box exactly instead of keeping proportions, matching the footer instance in Pencil.
export function Wordmark({ className = "h-8 w-auto", stretch = false }: { className?: string; stretch?: boolean }) {
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      preserveAspectRatio={stretch ? "none" : undefined}
      className={className}
      role="img"
      aria-label="Second Look"
    >
      <path d={WORDMARK_LETTERS} className="fill-ink" />
      <path d={WORDMARK_DOUBLE_RULE} className="fill-accent" />
    </svg>
  );
}
