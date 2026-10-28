import type { CSSProperties } from "react";

export function Sparkline({
  d,
  className = "h-[34px]",
  delay,
}: {
  d: string;
  className?: string;
  // When set, the line wipes in after this many milliseconds.
  delay?: number;
}) {
  return (
    <svg
      viewBox="0 0 148 34"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`block w-full ${className} ${delay === undefined ? "" : "wipe-in"}`}
      style={delay === undefined ? undefined : ({ "--delay": `${delay}ms` } as CSSProperties)}
    >
      <path
        d={d}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="stroke-accent"
      />
    </svg>
  );
}
