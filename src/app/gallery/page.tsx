"use client";

import { useState, useEffect } from "react";
import { getScreenshots, deleteScreenshot, setExpiry, type Screenshot } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function GalleryPage() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setScreenshots(getScreenshots());
  }, []);

  function handleDelete(id: string) {
    if (!confirm("Delete this screenshot?")) return;
    deleteScreenshot(id);
    setScreenshots(getScreenshots());
  }

  function handleExpiry(id: string, hours: number | null) {
    setExpiry(id, hours);
    setScreenshots(getScreenshots());
  }

  function copyLink(id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/s/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Screenshots</h1>

        {screenshots.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-muted mb-4">No screenshots yet</p>
            <Link href="/" className="metallic-text-gradient font-medium hover:underline">Upload your first screenshot &rarr;</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {screenshots.map((s) => (
              <div key={s.id} className="liquid-glass-card overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="aspect-video bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                  <img src={s.url} alt={s.filename} className="object-cover w-full h-full" />
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium truncate">{s.filename}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted">
                    <span>{formatSize(s.size)}</span>
                    <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                  {s.expiresAt && (
                    <p className="text-xs text-amber-400 mt-1">
                      Expires: {new Date(s.expiresAt).toLocaleString()}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => copyLink(s.id)}
                      className="chrome-pill-button primary flex-1 text-xs py-2"
                    >
                      {copiedId === s.id ? "✓ Copied" : "Copy Link"}
                    </button>
                    <select
                      onChange={(e) => handleExpiry(s.id, e.target.value === "never" ? null : Number(e.target.value))}
                      defaultValue={s.expiresAt ? "custom" : "never"}
                      className="glass-input text-xs py-2 px-2"
                    >
                      <option value="never">No expiry</option>
                      <option value="1">1 hour</option>
                      <option value="24">24 hours</option>
                      <option value="168">7 days</option>
                      <option value="720">30 days</option>
                    </select>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-2 rounded-lg text-xs font-medium transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
