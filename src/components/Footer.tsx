import { links } from "@/lib/site";
import { Wordmark } from "./Wordmark";

const footerLinks = [
  { label: "GitHub", href: links.github },
];

export function Footer() {
  return (
    <footer className="border-t border-rule bg-paper">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-10 xl:px-[120px]">
        <div className="flex items-center gap-4">
          <Wordmark className="h-8 w-auto shrink-0" />
          <p className="font-body text-sm text-text-2">Open source · MIT License</p>
        </div>
        <ul className="flex flex-wrap gap-7">
          {footerLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="inline-flex min-h-11 min-w-11 items-center font-body text-sm text-text-2 transition-colors hover:text-ink">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
