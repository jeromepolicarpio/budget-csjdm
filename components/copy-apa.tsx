"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyApa({ text, label = "Copy Citation" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silent no-op
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border rounded-md px-3 py-1.5 hover:bg-muted"
    >
      {copied ? (
        <Check size={12} className="text-green-500" />
      ) : (
        <Copy size={12} />
      )}
      {copied ? "Copied!" : label}
    </button>
  );
}
