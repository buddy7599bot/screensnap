"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { nanoid } from "nanoid";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { useScrollReveal } from "@/components/ScrollReveal";

/* ==========================================
   FLOATING SCREENSHOT PREVIEWS
   Fake screenshot thumbnails floating in hero bg
   ========================================== */
const FLOATING_SCREENSHOTS = [
  { top: "12%", left: "3%", right: undefined, rot: "-5deg", delay: "0s", content: "terminal", w: 192, h: 108, res: "1920 × 1080" },
  { top: "22%", left: undefined, right: "2%", rot: "4deg", delay: "1.5s", content: "code", w: 160, h: 100, res: "1440 × 900" },
  { top: "58%", left: "1%", right: undefined, rot: "3deg", delay: "3s", content: "chart", w: 176, h: 99, res: "2560 × 1440" },
  { top: "52%", left: undefined, right: "4%", rot: "-4deg", delay: "2s", content: "ui", w: 144, h: 108, res: "1366 × 768" },
];

function FloatingScreenshot({ type, res }: { type: string; res: string }) {
  const lines: Record<string, React.ReactNode> = {
    terminal: (
      <div className="ss-terminal">
        <div className="ss-titlebar"><div className="ss-dots"><span/><span/><span/></div><span className="ss-title">Terminal</span></div>
        <div className="ss-body">
          <div className="ss-line w-3/4 bg-green-400/30" />
          <div className="ss-line w-1/2 bg-rose-400/30" />
          <div className="ss-line w-2/3 bg-rose-400/20" />
          <div className="ss-line w-2/5 bg-green-400/20" />
        </div>
      </div>
    ),
    code: (
      <div className="ss-code">
        <div className="ss-titlebar"><div className="ss-dots"><span/><span/><span/></div><span className="ss-title">VS Code</span></div>
        <div className="ss-body">
          <div className="ss-line w-1/3 bg-rose-400/30" />
          <div className="ss-line w-3/4 bg-rose-300/20 ml-2" />
          <div className="ss-line w-1/2 bg-rose-300/20 ml-2" />
          <div className="ss-line w-1/4 bg-rose-400/30" />
          <div className="ss-line w-2/3 bg-rose-300/15 ml-4" />
        </div>
      </div>
    ),
    chart: (
      <div className="ss-chart">
        <div className="ss-titlebar"><div className="ss-dots"><span/><span/><span/></div><span className="ss-title">Dashboard</span></div>
        <div className="ss-body">
          <div className="ss-bars">
            <div className="ss-bar h-2" /><div className="ss-bar h-4" /><div className="ss-bar h-6" /><div className="ss-bar h-3" /><div className="ss-bar h-7" /><div className="ss-bar h-5" /><div className="ss-bar h-4" />
          </div>
        </div>
      </div>
    ),
    ui: (
      <div className="ss-ui">
        <div className="ss-titlebar"><div className="ss-dots"><span/><span/><span/></div><span className="ss-title">Figma</span></div>
        <div className="ss-body">
          <div className="ss-rect" />
          <div className="flex gap-1 mt-1">
            <div className="ss-btn" /><div className="ss-btn primary" />
          </div>
        </div>
      </div>
    ),
  };
  return (
    <div className="ss-screenshot-inner">
      {lines[type]}
      <div className="ss-resolution">{res}</div>
    </div>
  );
}

function ScreenshotSelectionAnim({ heroRef, uploadRef }: { heroRef: React.RefObject<HTMLDivElement | null>; uploadRef: React.RefObject<HTMLDivElement | null> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0); // 0,1,2 = three different selections
  const [rect, setRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [dims, setDims] = useState("0 × 0");
  const [animState, setAnimState] = useState<"idle" | "start" | "drawing" | "shown" | "flash" | "fade">("idle");

  useEffect(() => {
    let frame: number;
    let timeout: ReturnType<typeof setTimeout>;

    function measure(p: number) {
      const container = containerRef.current?.parentElement;
      if (!container) return;
      const base = container.getBoundingClientRect();

      let target: DOMRect;
      if (p === 0) {
        // Just the hero heading area
        const h1 = container.querySelector("h1");
        if (!h1) return;
        target = h1.getBoundingClientRect();
      } else if (p === 1) {
        // Entire hero section (text + badge + subtitle)
        target = container.getBoundingClientRect();
      } else if (p === 2) {
        // Hero text + upload zone
        const upload = uploadRef.current;
        if (!upload) return;
        const uploadRect = upload.getBoundingClientRect();
        target = new DOMRect(
          Math.min(base.left, uploadRect.left),
          base.top,
          Math.max(base.right, uploadRect.right) - Math.min(base.left, uploadRect.left),
          uploadRect.bottom - base.top
        );
      } else {
        // Full viewport
        target = new DOMRect(0, 0, window.innerWidth, window.innerHeight);
      }

      const relTop = target.top - base.top - 8;
      const relLeft = target.left - base.left - 8;
      const w = target.width + 16;
      const h = target.height + 16;

      setRect({ top: relTop, left: relLeft, width: w, height: h });
      setDims(`${Math.round(target.width)} × ${Math.round(target.height)}`);
    }

    function runCycle() {
      measure(phase);
      // First frame: set to "start" with width/height 0, visible
      setAnimState("start");
      // Next frame: trigger drawing transition
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          setAnimState("drawing");
        });
      });

      timeout = setTimeout(() => {
        setAnimState("shown");
        timeout = setTimeout(() => {
          setAnimState("flash");
          timeout = setTimeout(() => {
            setAnimState("fade");
            timeout = setTimeout(() => {
              setAnimState("idle");
              setPhase((p) => (p + 1) % 4);
            }, 500);
          }, 250);
        }, 1400);
      }, 1200);
    }

    // Small delay before starting each cycle
    timeout = setTimeout(runCycle, 300);

    return () => {
      clearTimeout(timeout);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [phase, uploadRef]);

  const isStart = animState === "start";
  const isDrawing = animState === "drawing";
  const isShown = animState === "shown" || animState === "flash";
  const isActive = isDrawing || isShown;
  const isFading = animState === "fade";
  const isIdle = animState === "idle";
  const isVisible = !isIdle;

  return (
    <div ref={containerRef} className="screenshot-selection-container" aria-hidden="true">
      <div
        className={`sel-rect ${animState === "flash" ? "sel-flash" : ""}`}
        style={{
          display: isVisible ? "block" : "none",
          top: rect.top,
          left: rect.left,
          width: isActive ? rect.width : 0,
          height: isActive ? rect.height : 0,
          opacity: isFading ? 0 : (isStart || isActive) ? 1 : 0,
          transition: isDrawing
            ? "width 1.2s cubic-bezier(0.22,1,0.36,1), height 1.2s cubic-bezier(0.22,1,0.36,1)"
            : isFading
            ? "opacity 0.4s"
            : "none",
        }}
      >
        {isShown && <div className="sel-handle tl visible" />}
        {isShown && <div className="sel-handle tr visible" />}
        {isShown && <div className="sel-handle bl visible" />}
        {isShown && <div className="sel-handle br visible" />}
        {(isStart || isDrawing || isShown) && (
          <div className="sel-crosshair visible">
            <div className="crosshair-h" />
            <div className="crosshair-v" />
          </div>
        )}
        {isShown && <div className="sel-dims visible">{dims}</div>}
      </div>
    </div>
  );
}

/* stats section removed */

const FEATURES = [
  { icon: "⚡", title: "Instant Sharing", desc: "Upload, get a link, share. No sign-up. Under 2 seconds." },
  { icon: "🔒", title: "Auto-Expire Links", desc: "Set links to expire in 1 hour, 24 hours, 7 days, or 30 days." },
  { icon: "📋", title: "Paste from Clipboard", desc: "Screenshot with Cmd+Shift+4, switch here, paste. Done." },
  { icon: "🗂️", title: "Gallery View", desc: "All your uploads in one place. Search, filter, manage." },
  { icon: "🎨", title: "No Ads, No Bloat", desc: "Clean, fast, beautiful. Just screenshot sharing that works." },
  { icon: "🌙", title: "Dark Mode", desc: "Easy on the eyes at any hour. Gorgeous dark UI." },
];

const STEPS = [
  { step: "1", title: "Take a screenshot", desc: "Use your OS screenshot tool or snipping tool" },
  { step: "2", title: "Paste or drop", desc: "Ctrl+V or drag and drop right here" },
  { step: "3", title: "Share the link", desc: "Auto-copied to clipboard. Send it anywhere." },
];

function UploadParticles({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="upload-particle"
          style={{
            "--angle": `${i * 30}deg`,
            "--distance": `${40 + Math.random() * 30}px`,
            "--delay": `${Math.random() * 0.2}s`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

function PixelGridReveal({ children }: { children: React.ReactNode }) {
  const cols = 22;
  const rows = 8;
  const pixels = useMemo(() => {
    const shades = ["#FB7185", "#F43F5E", "#FDA4AF"];
    const grid: Array<{
      id: string;
      delay: string;
      duration: string;
      sx: string;
      sy: string;
      ex: string;
      ey: string;
      color: string;
    }> = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        grid.push({
          id: `${row}-${col}`,
          delay: `${Math.random() * 0.6}s`,
          duration: `${2.1 + Math.random() * 0.7}s`,
          sx: `${Math.random() * 140 - 70}px`,
          sy: `${Math.random() * 90 - 45}px`,
          ex: `${Math.random() * 160 - 80}px`,
          ey: `${Math.random() * 120 - 60}px`,
          color: shades[Math.floor(Math.random() * shades.length)],
        });
      }
    }
    return grid;
  }, [cols, rows]);

  return (
    <div className="pixel-grid-reveal" style={{ "--cols": cols, "--rows": rows, "--reveal-delay": "0.1s" } as React.CSSProperties}>
      {children}
      <div className="pixel-grid-overlay" aria-hidden="true">
        {pixels.map((pixel) => (
          <span
            key={pixel.id}
            className="pixel-grid-dot"
            style={{
              "--delay": pixel.delay,
              "--duration": pixel.duration,
              "--sx": pixel.sx,
              "--sy": pixel.sy,
              "--ex": pixel.ex,
              "--ey": pixel.ey,
              backgroundColor: pixel.color,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { user, supabase, signInWithGoogle } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ url: string; id: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);

  /* unused scroll refs removed */

  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large (max 10MB)");
      return;
    }
    setError(null);
    setUploading(true);
    setResult(null);
    setJustUploaded(false);
    setShowSignInPrompt(false);
    try {
      // Get image dimensions (best effort)
      const objectUrl = URL.createObjectURL(file);
      let dimensions = { width: 0, height: 0 };
      try {
        const image = new Image();
        dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          image.onload = () => resolve({ width: image.width, height: image.height });
          image.onerror = () => resolve({ width: 0, height: 0 });
          image.src = objectUrl;
        });
      } catch {
        // Dimensions optional
      } finally {
        URL.revokeObjectURL(objectUrl);
      }

      // Upload via API route (server-side, bypasses RLS)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("width", String(dimensions.width));
      formData.append("height", String(dimensions.height));
      if (user?.id) formData.append("user_id", user.id);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setResult({ url: data.url, id: data.shortId });
      setJustUploaded(true);
      setTimeout(() => setJustUploaded(false), 1500);
      if (!user) {
        setShowSignInPrompt(true);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [user]);

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
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-rose-950/20 via-transparent to-transparent dark:from-rose-950/30" />
          
          {/* Floating screenshots removed */}

          <div className="relative max-w-4xl mx-auto px-6 pt-32 pb-16 text-center">
            {/* Hero text wrapped in selection animation target */}
            <div ref={heroRef} className="screenshot-target relative inline-block pb-4">
              <ScreenshotSelectionAnim heroRef={heroRef} uploadRef={uploadRef} />
              <div className="hero-entrance">
                <div className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-8 bg-rose-500/10 text-rose-500 dark:bg-rose-400/10 dark:text-rose-400 border border-rose-500/20 breathing-badge">
                  100% Free. No catch.
                </div>
              </div>
              <h1 className="hero-entrance text-5xl md:text-6xl font-extrabold leading-tight mb-5" style={{ animationDelay: "0.1s" }}>
                Screenshot to
                <span className="metallic-text-gradient"> share link</span>
                <br />in seconds
              </h1>
              <p className="hero-entrance text-xl text-muted max-w-2xl mx-auto mb-6" style={{ animationDelay: "0.2s" }}>
                Drop a screenshot. Get a link. That&apos;s it.
              </p>
            </div>

            {/* Upload Zone */}
            <div
              ref={uploadRef}
              className={`hero-entrance upload-zone liquid-glass-card relative border-2 border-dashed p-12 transition-all cursor-pointer mx-auto max-w-2xl ${
                dragOver ? "border-rose-500 scale-[1.02] upload-zone-active" : "border-border hover:border-rose-500/50"
              } ${justUploaded ? "upload-success" : ""}`}
              style={{ animationDelay: "0.3s" }}
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
                  <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-muted">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 relative">
                  <div className="mb-2 upload-icon text-rose-500">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  </div>
                  <p className="text-lg font-medium">Drop screenshot here, click to browse, or paste from clipboard</p>
                  <p className="text-sm text-muted">PNG, JPG, GIF, WebP - up to 10MB</p>
                  <div className="scan-line" />
                  <UploadParticles show={justUploaded} />
                </div>
              )}
            </div>

            {/* Result */}
            {result && (
              <div className="mt-8 max-w-2xl mx-auto liquid-glass-card p-6 result-entrance">
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
                {showSignInPrompt && (
                  <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm">
                    <span className="text-rose-500">Sign in to save this screenshot to your gallery.</span>
                    <button onClick={() => signInWithGoogle()} className="chrome-pill-button primary text-xs px-3 py-2">
                      Sign in
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="mt-6 max-w-2xl mx-auto bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        </section>

        {/* How it works - visual pipeline */}
        <section className="max-w-5xl mx-auto px-6 py-10">
          <h2 className="text-3xl font-bold text-center mb-4">Three seconds. That&apos;s it.</h2>
          <p className="text-center text-muted mb-16 max-w-md mx-auto">No hassle. No file size headaches. Just share.</p>
          
          <div className="hiw-pipeline">
            {/* Step 1 */}
            <div className="hiw-step group">
              <div className="hiw-icon-wrapper">
                <div className="hiw-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
                <div className="hiw-pulse" />
              </div>
              <div className="hiw-label">
                <span className="hiw-step-tag">Drop</span>
                <h3 className="font-semibold text-lg mt-2">Paste, drag, or click</h3>
                <p className="text-muted text-sm mt-1">Any image up to 10MB</p>
              </div>
            </div>

            {/* Connector */}
            <div className="hiw-connector">
              <div className="hiw-connector-line" />
              <div className="hiw-connector-dot" />
            </div>

            {/* Step 2 */}
            <div className="hiw-step group">
              <div className="hiw-icon-wrapper">
                <div className="hiw-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <div className="hiw-pulse" />
              </div>
              <div className="hiw-label">
                <span className="hiw-step-tag">Link</span>
                <h3 className="font-semibold text-lg mt-2">Instant share URL</h3>
                <p className="text-muted text-sm mt-1">Copied to clipboard automatically</p>
              </div>
            </div>

            {/* Connector */}
            <div className="hiw-connector">
              <div className="hiw-connector-line" />
              <div className="hiw-connector-dot" />
            </div>

            {/* Step 3 */}
            <div className="hiw-step group">
              <div className="hiw-icon-wrapper">
                <div className="hiw-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </div>
                <div className="hiw-pulse" />
              </div>
              <div className="hiw-label">
                <span className="hiw-step-tag">Share</span>
                <h3 className="font-semibold text-lg mt-2">Send it anywhere</h3>
                <p className="text-muted text-sm mt-1">Slack, email, X, Discord, anywhere</p>
              </div>
            </div>
          </div>
        </section>

        {/* DashPane Cross-Promo */}
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <a href="https://dashpane.pro" target="_blank" rel="noopener noreferrer" className="block liquid-glass-card p-6 md:p-8 transition hover:scale-[1.01] hover:shadow-lg group">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <img src="/dashpane-logo.png" alt="DashPane" className="flex-shrink-0 w-14 h-14" />
              <div className="flex-1 text-center md:text-left">
                <p className="text-xs text-foreground-secondary mb-1">From the makers of ScreenSnap</p>
                <h3 className="text-lg font-bold text-foreground group-hover:text-rose-500 dark:group-hover:text-rose-400 transition">DashPane: Save ~71 hours/year switching apps on macOS</h3>
                <p className="text-sm text-foreground-secondary mt-1">Beautiful command palette for developers and power users.</p>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 group-hover:bg-rose-500/20 transition">
                  Check it out →
                </span>
              </div>
            </div>
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted">
          <span>&copy; {new Date().getFullYear()} ScreenSnap</span>
          <span className="hidden sm:inline">·</span>
          <a href="https://jayeshbetala.com" target="_blank" rel="noopener noreferrer" className="hover:text-rose-500 dark:hover:text-rose-400 transition">Built by Jayesh Betala</a>
          <span className="hidden sm:inline">·</span>
          <a href="https://dashpane.pro" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition">Try DashPane</a>
          <span className="hidden sm:inline">·</span>
          <a href="/privacy" className="hover:text-rose-500 dark:hover:text-rose-400 transition">Privacy</a>
          <span className="hidden sm:inline">·</span>
          <a href="/terms" className="hover:text-rose-500 dark:hover:text-rose-400 transition">Terms</a>
        </div>
      </footer>
    </div>
  );
}
