import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "City of San Jose del Monte | People's Budget Portal",
  description: "Budget transparency tracker for City of San Jose del Monte, Bulacan. Follow the money.",
  openGraph: {
    title: "City of San Jose del Monte | People's Budget Portal",
    description: "Where did the money go? Track CSJDM's spending, contracts, and infrastructure projects.",
    siteName: "City of San Jose del Monte People's Budget Portal",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <Navbar />
        <main>{children}</main>
        <footer className="border-t py-8 mt-16">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              Data sourced from{" "}
              <a href="https://data.bettergov.ph" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                BetterGov.ph
              </a>
              , BLGF, PhilGEPS, and DPWH open data.
            </p>
            <p className="mt-1">Built by citizens, for citizens. Not affiliated with the City Government of CSJDM.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
