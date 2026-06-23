"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center text-center">
      <div className="bg-amber-50 border border-amber-200 rounded-full p-4 mb-6">
        <AlertTriangle size={32} className="text-amber-500" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Data temporarily unavailable</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        We couldn&apos;t load the latest data right now. This usually means our data sources
        (BetterGov or the database) are temporarily unreachable. Please try again in a moment.
      </p>
      <button
        onClick={reset}
        className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
