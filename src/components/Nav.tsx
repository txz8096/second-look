import { Wordmark } from "./Wordmark";

const navLinks = [
  { label: "The approach", href: "#approach" },
  { label: "Sample report", href: "#sample-report" },
  { label: "FAQ", href: "#faq" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper">
      <nav className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6 px-5 py-6 md:px-10 xl:px-[120px]">
        <a href="#top" className="flex items-center gap-3">
          <Wordmark className="h-7 w-auto md:h-8" />
          <span className="hidden font-body text-[13px] text-text-3 lg:inline">
            A reflection skill for AI work
          </span>
        </a>
        <div className="flex items-center gap-8">
          <ul className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="font-body text-[15px] whitespace-nowrap text-text-2 transition-colors hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#install"
            className="rounded-md bg-accent px-[18px] py-2.5 font-body text-[15px] leading-[1.25] font-medium whitespace-nowrap text-on-accent transition-[background-color,scale] duration-150 ease-out hover:bg-accent/90 motion-safe:active:scale-[0.97]"
          >
            Get the skill
          </a>
        </div>
      </nav>
    </header>
  );
}
