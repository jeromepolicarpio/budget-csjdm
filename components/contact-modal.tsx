"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REASONS = ["Data error", "Missing data", "Suggestion", "Other"] as const;

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Status = "idle" | "sending" | "success" | "error";

export function ContactModal({ open, onOpenChange }: ContactModalProps) {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState<string>("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reason, message }),
      });

      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setEmail("");
      setReason("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) setStatus("idle");
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Got a tip or correction?</DialogTitle>
          <DialogDescription>
            Spotted an error or have a suggestion? I read every message.
          </DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="py-6 text-center">
            <p className="text-sm font-medium text-green-700">Message sent — thank you!</p>
            <p className="text-xs text-muted-foreground mt-1">I&apos;ll get back to you via email.</p>
            <Button variant="outline" className="mt-4" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-[15px]">
              <label className="text-sm font-medium" htmlFor="contact-email">
                Your email
              </label>
              <input
                id="contact-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-[15px]">
              <label className="text-sm font-medium" htmlFor="contact-reason">
                Reason
              </label>
              <Select value={reason} onValueChange={(v) => setReason(v ?? "")} required>
                <SelectTrigger id="contact-reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-[15px]">
              <label className="text-sm font-medium" htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={4}
                placeholder="Describe the issue or suggestion..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            {status === "error" && (
              <p className="text-xs text-destructive">Failed to send — check your connection and try again.</p>
            )}

            <div className="flex justify-end gap-3 pt-5">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={status === "sending" || !reason} className="min-w-[110px]">
                {status === "sending" ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Sending…
                  </span>
                ) : (
                  "Send message"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
