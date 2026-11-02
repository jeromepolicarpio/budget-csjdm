"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, ArrowUpRight } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; external?: boolean };

const NATIONAL_BUDGET_URL = "https://national-budget-csjdm.vercel.app";

const links: NavItem[] = [
  { href: "/", label: "Overview" },
  { href: "/budget", label: "Budget" },
  { href: "/procurement", label: "Procurement" },
  { href: "/projects", label: "Projects" },
  { href: "/accountability", label: "Accountability" },
  { href: NATIONAL_BUDGET_URL, label: "National Budget", external: true },
  { href: "/docs", label: "Docs" },
];

const IDLE = "text-muted-foreground hover:text-foreground hover:bg-muted";
const ACTIVE = "bg-primary text-primary-foreground font-medium";

function NavLink({ link, active, className, onClick }: {
  link: NavItem;
  active: boolean;
  className: string;
  onClick?: () => void;
}) {
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={cn(className, "inline-flex items-center gap-1", IDLE)}
      >
        {link.label}
        <ArrowUpRight size={14} aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link
      href={link.href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(className, active ? ACTIVE : IDLE)}
    >
      {link.label}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
    {open && (
      <div
        className="lg:hidden fixed inset-0 z-40 bg-background/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
    )}
    <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Image
            src="/San-Jose-del-Monte-Official-Seal.png"
            alt="City of San Jose del Monte Official Seal"
            width={36}
            height={36}
            className="rounded-full"
            priority
          />
          <div className="leading-tight">
            <div className="text-xs font-semibold tracking-tight">City of San Jose del Monte</div>
            <div className="text-xs text-muted-foreground">People&apos;s Budget Portal</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.href}
              link={link}
              active={pathname === link.href}
              className="px-3 py-1.5 rounded-md text-sm transition-colors"
            />
          ))}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="ml-1 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </nav>

        {/* Mobile controls */}
        <div className="lg:hidden flex items-center gap-1">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div id="mobile-menu" className="lg:hidden border-t bg-background/95 backdrop-blur animate-in fade-in slide-in-from-top-1 duration-150">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.href}
                link={link}
                active={pathname === link.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-md text-sm transition-colors"
              />
            ))}
          </nav>
        </div>
      )}
    </header>
    </>
  );
}
