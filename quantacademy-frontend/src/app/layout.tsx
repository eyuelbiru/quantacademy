import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuantAcademy — Learn Multi-Market Trading",
  description: "Master trading strategies across Forex, Equities, and Crypto with AI-powered mentorship",
};

const NAV_LINKS = [
  { href: "/", label: "Strategies" },
  { href: "/chart", label: "Chart" },
  { href: "/simulation", label: "Simulator" },
  { href: "/progress", label: "Progress" },
  { href: "/chat", label: "AI Mentor" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="sticky top-0 z-50 border-b border-[#1e293b] bg-[#0b1120]/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <a href="/" className="flex items-center gap-2 text-lg font-bold text-emerald-400 tracking-tight">
              <span className="inline-block h-5 w-5 rounded-sm bg-emerald-400/20 ring-1 ring-emerald-400/50" />
              QuantAcademy
            </a>

            <nav className="flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-md px-3 py-1.5 text-sm text-slate-400 transition-colors hover:text-emerald-300 hover:bg-emerald-400/5"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>

          {/* HUD top line glow */}
          <div className="pointer-events-none absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
