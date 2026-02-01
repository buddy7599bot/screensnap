"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { uploadScreenshot } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ url: string; id: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    setError(null);
    setUploading(true);
    setResult(null);
    try {
      const res = await uploadScreenshot(file);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) handleUpload(file);
        break;
      }
    }
  }, [handleUpload]);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const copyLink = () => {
    if (!result) return;
    const shareUrl = `${window.location.origin}/s/${result.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = result ? `${typeof window !== "undefined" ? window.location.origin : ""}/s/${result.id}` : "";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-sky-500/10 text-sky-500 dark:bg-sky-400/10 dark:text-sky-400 border border-sky-500/20">
            ✨ Share screenshots instantly
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Screenshot to
            <span className="metallic-text-gradient"> share link</span>
            <br />in seconds
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-12">
            Drop a screenshot, get a shareable link. No account needed. Set auto-expiry for sensitive content.
            The simplest way to share screenshots on the internet.
          </p>

          {/* Upload Zone */}
          <div
            className={`liquid-glass-card relative border-2 border-dashed p-12 transition-all cursor-pointer mx-auto max-w-2xl ${
              dragOver
                ? "border-sky-500 scale-[1.02]"
                : "border-border hover:border-sky-500/50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-muted">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="text-5xl mb-2">📸</div>
                <p className="text-lg font-medium">Drop screenshot here, click to browse, or paste from clipboard</p>
                <p className="text-sm text-muted">PNG, JPG, GIF, WebP - up to 10MB</p>
              </div>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className="mt-8 max-w-2xl mx-auto liquid-glass-card p-6">
              <p className="text-sm text-muted mb-3">Your shareable link:</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="glass-input flex-1 text-sm font-mono"
                />
                <button
                  onClick={copyLink}
                  className="chrome-pill-button primary whitespace-nowrap"
                >
                  {copied ? "✓ Copied!" : "Copy Link"}
                </button>
              </div>
              <div className="mt-4">
                <img src={result.url} alt="Uploaded" className="max-h-48 rounded-lg mx-auto" />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 max-w-2xl mx-auto bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-center mb-12">Why ScreenSnap?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "⚡", title: "Instant Sharing", desc: "Upload, link, share. No sign-up required. Get a shareable URL in under 2 seconds." },
              { icon: "🔒", title: "Auto-Expire Links", desc: "Set links to expire in 1 hour, 24 hours, 7 days, or 30 days. Perfect for sensitive screenshots." },
              { icon: "🎨", title: "Clean & Fast", desc: "No ads, no bloat, no tracking. Just a beautiful, fast screenshot sharing tool that works." },
              { icon: "📋", title: "Paste from Clipboard", desc: "Take a screenshot with Cmd+Shift+4, switch to ScreenSnap, paste. Link copied. Done." },
              { icon: "🗂️", title: "Gallery View", desc: "All your uploads in one place. Search, filter, manage expiry, delete. Full control." },
              { icon: "🌙", title: "Dark Mode", desc: "Easy on the eyes. Beautiful dark UI that looks great at any hour." },
            ].map((f) => (
              <div key={f.title} className="liquid-glass-card p-6 hover:scale-[1.02] transition-transform">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
            {[
              { step: "1", title: "Take a screenshot", desc: "Use your OS screenshot tool" },
              { step: "2", title: "Paste or drop", desc: "Ctrl+V or drag & drop here" },
              { step: "3", title: "Share the link", desc: "Copied to clipboard instantly" },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {s.step}
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-muted text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
          <p className="text-muted text-center mb-12">No hidden fees. Cancel anytime.</p>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="liquid-glass-card p-8">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <p className="text-4xl font-extrabold mb-4">$0<span className="text-lg text-muted font-normal">/mo</span></p>
              <ul className="space-y-3 text-sm text-muted mb-8">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 10 uploads/month</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Shareable links</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 24h auto-expiry</li>
                <li className="flex items-center gap-2"><span className="text-foreground-secondary">✗</span> Custom expiry</li>
                <li className="flex items-center gap-2"><span className="text-foreground-secondary">✗</span> Gallery</li>
              </ul>
              <button className="chrome-pill-button w-full">
                Get Started Free
              </button>
            </div>
            <div className="liquid-glass-card p-8 relative ring-2 ring-sky-500/50">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-400 to-sky-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-4xl font-extrabold mb-4">$4<span className="text-lg text-muted font-normal">/mo</span></p>
              <ul className="space-y-3 text-sm text-muted mb-8">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Unlimited uploads</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Shareable links</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Custom expiry (1h to never)</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Gallery with search</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Priority support</li>
              </ul>
              <button className="chrome-pill-button primary w-full">
                Start Pro Trial
              </button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Stop wasting time sharing screenshots</h2>
          <p className="text-muted mb-8">Join thousands of developers, designers, and teams who use ScreenSnap daily.</p>
          <button className="chrome-pill-button primary text-lg px-8 py-4">
            Get Started - It&apos;s Free
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted">
          <p>&copy; 2026 ScreenSnap. Built with ❤️</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition">Privacy</a>
            <a href="#" className="hover:text-foreground transition">Terms</a>
            <a href="#" className="hover:text-foreground transition">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
