"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  const Icon = copied ? Check : Copy;

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      className="-m-3 inline-flex size-11 shrink-0 items-center justify-center rounded text-text-3 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
    >
      <Icon key={String(copied)} size={18} className={copied ? "icon-in" : undefined} aria-hidden="true" />
    </button>
  );
}
