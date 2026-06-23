"use client";

import { useState } from "react";
import { ContactModal } from "@/components/contact-modal";

export function ContactTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="underline hover:text-foreground"
      >
        contact the maintainer
      </button>
      <ContactModal open={open} onOpenChange={setOpen} />
    </>
  );
}
