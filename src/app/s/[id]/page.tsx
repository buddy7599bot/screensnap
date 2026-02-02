import Link from "next/link";
import { headers } from "next/headers";
import Navbar from "@/components/Navbar";
import CopyLinkButton from "@/components/CopyLinkButton";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type ScreenshotRow = {
  id: string;
  short_id: string;
  file_url: string;
  original_name: string | null;
  title: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
  views: number | null;
  user_id: string | null;
};

type ProfileRow = {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { data: screenshot } = await supabase
    .from("screenshots")
    .select(
      "id, short_id, file_url, original_name, title, width, height, created_at, views, user_id"
    )
    .eq("short_id", (await params).id)
    .maybeSingle<ScreenshotRow>();

  if (!screenshot) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold mb-2">Screenshot Not Found</h1>
            <p className="text-muted mb-6">This screenshot may have been deleted or the link is invalid.</p>
            <Link href="/" className="chrome-pill-button primary inline-block">
              Upload a screenshot
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (screenshot.id) {
    const nextViews = (screenshot.views ?? 0) + 1;
    await supabase.from("screenshots").update({ views: nextViews }).eq("id", screenshot.id);
  }

  let profile: ProfileRow | null = null;
  if (screenshot.user_id) {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("display_name, username, avatar_url")
      .eq("id", screenshot.user_id)
      .maybeSingle<ProfileRow>();
    profile = profileRow ?? null;
  }

  const displayName =
    profile?.display_name || profile?.username || (screenshot.user_id ? "ScreenSnap user" : "Anonymous");

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "https";
  const shareUrl = host ? `${protocol}://${host}/s/${screenshot.short_id}` : `/s/${screenshot.short_id}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 pt-24">
        <div className="max-w-3xl w-full mx-auto">
          {/* Back button */}
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-rose-500 transition mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            Home
          </Link>

          {/* Image container - constrained height */}
          <div className="liquid-glass-card p-3 overflow-hidden">
            <img
              src={screenshot.file_url}
              alt={screenshot.title || screenshot.original_name || "Screenshot"}
              className="rounded-lg w-full max-h-[70vh] object-contain"
            />
          </div>

          {/* Info bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <div className="flex flex-col">
              <span className="text-foreground font-medium">
                {screenshot.title || screenshot.original_name || "Untitled"}
              </span>
              <span>
                {screenshot.width && screenshot.height
                  ? `${screenshot.width} × ${screenshot.height}`
                  : "Unknown dimensions"}
              </span>
            </div>
            <div className="text-right">
              <span className="block">{new Date(screenshot.created_at).toLocaleDateString()}</span>
              <span className="block">{screenshot.views ?? 0} views</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-rose-500/20 flex items-center justify-center text-xs text-rose-500">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span>Uploaded by {displayName}</span>
            </div>
            <CopyLinkButton
              url={shareUrl}
              className="chrome-pill-button primary text-sm px-4 py-2"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
