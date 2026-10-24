export function Sparkline({
  d,
  tone,
  className = "h-[34px]",
}: {
  d: string;
  tone: "accent" | "muted";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 148 34"
      preserveAspectRatio="none"
      className={`block w-full ${className}`}
      aria-hidden="true"
    >
      <path
        d={d}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={tone === "accent" ? "stroke-accent" : "stroke-text-2"}
      />
    </svg>
  );
}
