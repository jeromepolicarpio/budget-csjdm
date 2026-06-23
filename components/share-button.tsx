"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface Props {
  title: string;
  text: string;
}

export function ShareButton({ title, text }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareText = `${title}\n\n${text}\n\nSource: ${window.location.href}`;

    if (navigator.share) {
      await navigator.share({ title, text: shareText, url: window.location.href }).catch(() => null);
      return;
    }

    await navigator.clipboard?.writeText(shareText).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mt-2 ml-8"
      title="Share this finding"
    >
      {copied ? (
        <>
          <Check size={13} className="text-green-600" />
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <Share2 size={13} />
          Share
        </>
      )}
    </button>
  );
}
