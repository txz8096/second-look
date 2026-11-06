import { Container, Kicker } from "./ui";

// The real report, embedded: public/sample-report.html is copied from the skill's report-template.html at build time.
const reportUrl = `${process.env.PAGES_BASE_PATH ?? ""}/sample-report.html`;

export function SampleReport() {
  return (
    <section id="sample-report" className="border-y border-rule bg-surface">
      <Container className="flex flex-col gap-8 py-20 lg:py-28">
        <div className="flex items-baseline justify-between gap-6">
          <Kicker as="h2">Sample report</Kicker>
          <a
            href={reportUrl}
            target="_blank"
            rel="noopener"
            className="font-body text-sm font-medium text-accent underline underline-offset-4 hover:text-ink"
          >
            Open the full report
          </a>
        </div>
        <iframe
          src={reportUrl}
          title="A sample second look report"
          loading="lazy"
          className="block h-[70dvh] w-full rounded-[14px] border border-rule bg-[#0a0a0a] md:h-[820px]"
        />
      </Container>
    </section>
  );
}
