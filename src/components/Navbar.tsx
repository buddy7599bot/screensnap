"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const avatarUrl = useMemo(() => {
    if (!user) return null;
    const m = user.user_metadata ?? {};
    return m.avatar_url || m.picture || null;
  }, [user]);

  const displayName = useMemo(() => {
    if (!user) return "";
    const m = user.user_metadata ?? {};
    return m.full_name || m.name || user.email?.split("@")[0] || "User";
  }, [user]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none pt-4 px-4">
      <nav className="nav-floating pointer-events-auto">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link href="/" className="nav-logo-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-rose-500 flex-shrink-0">
              <path d="M3 8V5a2 2 0 0 1 2-2h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 3h3a2 2 0 0 1 2 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M21 16v3a2 2 0 0 1-2 2h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 21H5a2 2 0 0 1-2-2v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2"/>
            </svg>
            <span className="nav-logo-text">ScreenSnap</span>
          </Link>

          <div className="flex items-center gap-1">
          {/* Gallery link when on gallery page */}
          {user && (
            <Link href="/gallery" className="nav-icon-btn" aria-label="Gallery">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            </Link>
          )}
          {/* Theme toggle */}
          <button
            className="nav-icon-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {mounted ? (theme === "dark" ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )) : <div className="w-[15px] h-[15px]" />}
          </button>

          {/* Auth */}
          {!loading && (
            <>
              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    className="nav-avatar-btn"
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label="User menu"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-[10px] font-bold">{displayName.charAt(0).toUpperCase()}</span>
                    )}
                  </button>
                  {menuOpen && (
                    <div className="nav-dropdown">
                      <div className="px-3 py-2 text-xs text-[var(--foreground-secondary)] border-b border-[var(--border)]">
                        {displayName}
                      </div>
                      <Link
                        href="/gallery"
                        className="nav-dropdown-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                        Gallery
                      </Link>
                      <button
                        onClick={() => { setMenuOpen(false); signOut(); }}
                        className="nav-dropdown-item w-full text-left"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button className="nav-signin-btn" onClick={() => signInWithGoogle()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  Sign in
                </button>
              )}
            </>
          )}
          </div>
        </div>
      </nav>
    </header>
  );
}
