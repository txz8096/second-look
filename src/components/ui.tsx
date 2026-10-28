import type { ComponentProps, ReactNode } from "react";

export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1440px] px-5 md:px-10 xl:px-[120px] ${className}`}>
      {children}
    </div>
  );
}

export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[13px] tracking-[1.2px] text-accent uppercase ${className}`}>
      {children}
    </p>
  );
}

export function SectionHeading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`font-display text-[36px] font-bold leading-[1.08] tracking-[-0.9px] text-ink md:text-[48px] md:tracking-[-1.2px] ${className}`}
    >
      {children}
    </h2>
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-md font-body font-medium transition-[color,background-color,scale] duration-150 ease-out motion-safe:active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function PrimaryButton({ className = "", ...props }: ComponentProps<"a">) {
  return (
    <a
      className={`${buttonBase} bg-accent px-6 py-[15px] text-base text-on-accent hover:bg-accent/90 ${className}`}
      {...props}
    />
  );
}

export function SecondaryButton({ className = "", ...props }: ComponentProps<"a">) {
  return (
    <a
      className={`${buttonBase} border border-ink px-[22px] py-[14px] text-base text-ink hover:bg-ink/5 ${className}`}
      {...props}
    />
  );
}

type PillVariant = "neutral" | "tint" | "solid" | "outline";

const pillStyles: Record<PillVariant, string> = {
  neutral: "bg-pill text-text-2",
  tint: "bg-accent-tint text-accent",
  solid: "bg-accent text-on-accent",
  outline: "text-text-2 outline outline-1 -outline-offset-1 outline-rule",
};

export function Pill({ variant, children }: { variant: PillVariant; children: ReactNode }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 font-body text-xs font-semibold whitespace-nowrap ${pillStyles[variant]}`}
    >
      {children}
    </span>
  );
}
