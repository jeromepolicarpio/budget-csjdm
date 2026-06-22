"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Overview" },
  { href: "/budget", label: "Budget" },
  { href: "/procurement", label: "Procurement" },
  { href: "/projects", label: "Projects" },
  { href: "/accountability", label: "Accountability" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="leading-tight">
          <div className="text-xs font-semibold tracking-tight">City of San Jose del Monte</div>
          <div className="text-xs text-muted-foreground">People&apos;s Budget Portal</div>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm transition-colors",
                pathname === link.href
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
