"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <nav className="glass-navbar px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            S
          </div>
          <span className="text-xl font-bold">ScreenSnap</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/gallery" className="text-muted hover:text-foreground transition text-sm">Gallery</Link>
          <Link href="#pricing" className="text-muted hover:text-foreground transition text-sm">Pricing</Link>
          <button
            className="chrome-ring-button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <span className="chrome-ring-inner">
              {mounted ? (theme === "dark" ? "☀️" : "🌙") : "🌙"}
            </span>
          </button>
          <button className="chrome-pill-button primary">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
