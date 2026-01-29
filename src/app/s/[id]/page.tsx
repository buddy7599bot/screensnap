"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ScreenshotData {
  id: string;
  url: string;
  filename: string;
  createdAt: string;
  expiresAt: string | null;
}

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const [screenshot, setScreenshot] = useState<ScreenshotData | null>(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resolvedId, setResolvedId] = useState<string>("");

  useEffect(() => {
    params.then(({ id }) => {
      setResolvedId(id);
      // Check localStorage
      const raw = localStorage.getItem("screensnap_screenshots");
      if (raw) {
        const items: ScreenshotData[] = JSON.parse(raw);
        const found = items.find((s) => s.id === id);
        if (found) {
          if (found.expiresAt && new Date(found.expiresAt) < new Date()) {
            setExpired(true);
          } else {
            setScreenshot(found);
          }
        }
      }
      setLoading(false);
    });
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold mb-2">Link Expired</h1>
          <p className="text-muted mb-6">This screenshot link has expired.</p>
          <Link href="/" className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg transition inline-block">
            Upload a new screenshot
          </Link>
        </div>
      </div>
    );
  }

  if (!screenshot) {
    // If not in localStorage, the blob URL might still work — show the image via URL param
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">Screenshot Not Found</h1>
          <p className="text-muted mb-6">This screenshot may have been deleted or the link is invalid.</p>
          <Link href="/" className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg transition inline-block">
            Upload a screenshot
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="text-xl font-bold">ScreenSnap</span>
        </Link>
        <Link href="/" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          Upload Your Own
        </Link>
      </nav>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <img
            src={screenshot.url}
            alt={screenshot.filename || "Screenshot"}
            className="rounded-xl shadow-2xl w-full"
          />
          <div className="mt-4 flex items-center justify-between text-sm text-muted">
            <span>{screenshot.filename}</span>
            <span>{new Date(screenshot.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
