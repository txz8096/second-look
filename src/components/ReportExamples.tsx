import type { ReactNode } from "react";
import { Container, Kicker, SectionHeading } from "./ui";

export function FeatureSection({ id, kicker, title, description, link, children }: {
  id: string;
  kicker: string;
  title: string;
  description: string;
  link?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="bg-paper">
      <Container className="grid items-center gap-8 py-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12 xl:grid-cols-[480px_minmax(0,1fr)] xl:gap-16 xl:py-16">
        <div className="feature-copy flex min-w-0 flex-col gap-5" data-reveal="entrance">
          <Kicker>{kicker}</Kicker>
          <SectionHeading size="feature">{title}</SectionHeading>
          <p className="font-body text-base leading-[1.55] text-text-2">{description}</p>
          {link}
        </div>
        <div className="hero-stage min-w-0 lg:flex lg:min-h-[520px] lg:flex-col lg:justify-center xl:-mr-14" data-reveal="entrance">
          <div className="feature-shot">{children}</div>
        </div>
      </Container>
    </section>
  );
}

export function ReportExcerpt({ title, description, className = "", children }: {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article className={`min-w-0 overflow-hidden rounded-xl border border-accent/25 bg-dark shadow-xl shadow-black/30 ${className}`}>
      <header className="border-b border-rule bg-accent/10 px-4 py-4 sm:px-6">
        <h3 className="font-display text-base leading-snug font-bold text-accent">{title}</h3>
        {description && <p className="mt-1 text-sm text-text-3">{description}</p>}
      </header>
      {children}
    </article>
  );
}
