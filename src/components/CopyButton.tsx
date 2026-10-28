"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text, label, compact = false }: { text: string; label: string; compact?: boolean }) {
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

  if (compact) {
    return (
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : label}
        className="shrink-0 rounded p-0.5 text-text-3 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
      >
        <Icon key={String(copied)} size={14} className={copied ? "icon-in" : undefined} aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      className="inline-flex shrink-0 items-center gap-1.5 rounded border border-rule px-2 py-1 font-mono text-xs text-text-3 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
    >
      <Icon key={String(copied)} size={14} className={copied ? "icon-in" : undefined} aria-hidden="true" />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
