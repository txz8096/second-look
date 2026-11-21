"use client";

import { useEffect } from "react";

// Marks each [data-reveal] element once it scrolls into view; globals.css animates the change.
export function RevealOnScroll() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    const revealOnFocus = (event: FocusEvent) => {
      const target = event.currentTarget as HTMLElement;
      target.setAttribute("data-reveal-instant", "");
      target.setAttribute("data-revealed", "");
      observer.unobserve(target);
    };
    targets.forEach((target) => {
      observer.observe(target);
      if (target.dataset.reveal === "entrance") target.addEventListener("focusin", revealOnFocus);
    });
    return () => {
      observer.disconnect();
      targets.forEach((target) => target.removeEventListener("focusin", revealOnFocus));
    };
  }, []);

  return null;
}
