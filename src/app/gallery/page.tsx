"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { createBrowserSupabaseClient } from "@/lib/supabase";

type ScreenshotRow = {
  id: string;
  short_id: string;
  file_url: string;
  thumbnail_url: string | null;
  original_name: string | null;
  title: string | null;
  width: number | null;
  height: number | null;
  views: number | null;
  created_at: string;
  file_size: number | null;
};

function formatSize(bytes: number | null) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extractStoragePath(fileUrl: string) {
  const marker = "/storage/v1/object/public/screenshots/";
  const index = fileUrl.indexOf(marker);
  if (index === -1) return null;
  return fileUrl.slice(index + marker.length);
}

export default function GalleryPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [screenshots, setScreenshots] = useState<ScreenshotRow[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  useEffect(() => {
    async function loadGallery() {
      if (loading) return;
      if (!user) { setFetching(false); return; }
      setFetching(true);
      const { data, error } = await supabase
        .from("screenshots")
        .select(
          "id, short_id, file_url, thumbnail_url, original_name, title, width, height, views, created_at, file_size"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Gallery fetch error:", error);
      }
      if (data) {
        setScreenshots(data);
      }
      setFetching(false);
    }

    loadGallery();
  }, [supabase, user, loading]);

  async function handleDelete(screenshot: ScreenshotRow) {
    if (!confirm("Delete this screenshot?")) return;
    const storagePath = extractStoragePath(screenshot.file_url);
    if (storagePath) {
      await supabase.storage.from("screenshots").remove([storagePath]);
    }
    await supabase.from("screenshots").delete().eq("id", screenshot.id);
    setScreenshots((items) => items.filter((item) => item.id !== screenshot.id));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-4 pb-12">
        <div className="flex items-center justify-between mb-8" style={{ height: 48, marginTop: 2 }}>
          <h1 className="text-2xl font-bold">Your Screenshots</h1>
          <Link href="/" className="chrome-pill-button primary text-sm px-4 py-1.5">
            + Upload new
          </Link>
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : screenshots.length === 0 ? (
          <div className="text-center py-20 liquid-glass-card">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-muted mb-4">No screenshots yet. Start by sharing one!</p>
            <Link href="/" className="metallic-text-gradient font-medium hover:underline">
              Upload your first screenshot &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {screenshots.map((screenshot) => (
              <div
                key={screenshot.id}
                className="liquid-glass-card overflow-hidden group hover:scale-[1.02] transition-transform"
              >
                <Link href={`/s/${screenshot.short_id}`}>
                  <div className="aspect-video bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                    <img
                      src={screenshot.thumbnail_url || screenshot.file_url}
                      alt={screenshot.title || screenshot.original_name || "Screenshot"}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-sm font-medium truncate">
                    {screenshot.title || screenshot.original_name || "Untitled"}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted">
                    <span>{formatSize(screenshot.file_size)}</span>
                    <span>
                      {screenshot.width && screenshot.height
                        ? `${screenshot.width} × ${screenshot.height}`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted">
                    <span>{new Date(screenshot.created_at).toLocaleDateString()}</span>
                    <span>{screenshot.views ?? 0} views</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/s/${screenshot.short_id}`}
                      className="chrome-pill-button primary flex-1 text-xs py-2 text-center"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(screenshot)}
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
