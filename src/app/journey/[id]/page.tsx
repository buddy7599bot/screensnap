import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import CopyLinkButton from "@/components/CopyLinkButton";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Metadata } from "next";

interface JourneyData {
  short_id: string;
  user_name: string;
  streak: number;
  total_logs: number;
  active_days: number;
  wins: number;
  week_data: { day: string; count: number }[];
  entries: { text: string; category: string; created_at: string }[];
}

const categoryColors: Record<string, string> = {
  build: "#84CC16",
  launch: "#F43F5E",
  metric: "#3B82F6",
  learn: "#8B5CF6",
  win: "#F59E0B",
};

const categoryIcons: Record<string, React.ReactNode> = {
  build: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  launch: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  metric: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
  learn: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  ),
  win: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
};

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("journey_shares")
    .select("user_name, streak")
    .eq("short_id", id)
    .single();

  if (!data) return { title: "Journey Not Found" };

  return {
    title: `${data.user_name}'s ShipLog Journey | ScreenSnap`,
    description: `${data.user_name} is on a ${data.streak}-day streak! Check out their shipping journey.`,
  };
}

export default async function JourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("journey_shares")
    .select("*")
    .eq("short_id", id)
    .single();

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold mb-2">Journey Not Found</h1>
            <p className="text-muted mb-6">This journey may have been deleted or the link is invalid.</p>
            <Link href="/" className="chrome-pill-button primary inline-block">
              Upload a screenshot
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const journey = data as JourneyData;
  const maxCount = Math.max(...(journey.week_data?.map((d) => d.count) || [1]), 1);

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "https";
  const shareUrl = host ? `${protocol}://${host}/journey/${journey.short_id}` : `/journey/${journey.short_id}`;

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

          {/* Journey card */}
          <div className="liquid-glass-card p-3 overflow-hidden">
            <div className="p-6 pb-5">
              {/* Co-branding */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="flex items-center gap-1.5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-rose-500">
                    <path d="M3 8V5a2 2 0 0 1 2-2h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M16 3h3a2 2 0 0 1 2 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M21 16v3a2 2 0 0 1-2 2h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 21H5a2 2 0 0 1-2-2v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
                  </svg>
                  <span className="text-xs font-semibold text-white/60">ScreenSnap</span>
                </div>
                <span className="text-white/20">×</span>
                <div className="flex items-center gap-1.5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-lime-500">
                    <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
                    <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 7l9 5 9-5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7.5 4.5L16.5 9.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span className="text-xs font-semibold text-white/60">ShipLog</span>
                </div>
              </div>

              {/* User Name */}
              <div className="text-center mb-5">
                <h1 className="text-lg font-bold text-white/90">{journey.user_name}</h1>
                <p className="text-xs text-white/40 mt-0.5">Shipping Journey</p>
              </div>

              {/* Streak */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#F97316" stroke="none">
                  <path d="M12 23c-3.866 0-7-2.239-7-5 0-2.485 1.63-4.378 3.304-5.902.88-.8 1.762-1.52 2.45-2.248C11.86 8.684 12.5 7.5 12.5 6c0 0 1 2.5 1 4.5 0 .834-.247 1.505-.59 2.063-.345.558-.799 1.04-1.206 1.49-.768.854-1.373 1.63-1.373 2.947 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.78-.912-3.244-1.842-4.486-.478-.638-.975-1.232-1.389-1.855C12.69 10.04 12.5 9.314 12.5 8.5c0 0 3.5 2.5 5.5 5.5.667 1 1 2.167 1 3 0 2.761-3.134 5-7 5z" />
                </svg>
                <span className="text-4xl font-black text-lime-400">
                  {journey.streak}
                </span>
                <span className="text-sm font-medium text-white/50 mt-1">day streak</span>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                {[
                  { label: "Logs", value: journey.total_logs },
                  { label: "Days", value: journey.active_days },
                  { label: "Wins", value: journey.wins },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm p-3 text-center"
                  >
                    <div className="text-xl font-bold text-white/90">{stat.value}</div>
                    <div className="text-[10px] font-medium text-white/40 uppercase tracking-wider mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Chart */}
              {journey.week_data && journey.week_data.length > 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 mb-6">
                  <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-3">
                    This Week
                  </h3>
                  <div className="flex items-end justify-between gap-1.5 h-20">
                    {dayLabels.map((label, i) => {
                      const dayData = journey.week_data[i];
                      const count = dayData?.count || 0;
                      const height = count > 0 ? Math.max((count / maxCount) * 100, 12) : 4;
                      return (
                        <div key={label} className="flex flex-col items-center gap-1.5 flex-1">
                          <div className="w-full flex items-end justify-center h-16">
                            <div
                              className={`w-full max-w-[20px] rounded-t-md transition-all ${
                                count > 0
                                  ? "bg-lime-500"
                                  : "bg-white/[0.06]"
                              }`}
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-medium text-white/30">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Entries */}
              {journey.entries && journey.entries.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2.5">
                    Recent Entries
                  </h3>
                  <div className="space-y-2">
                    {journey.entries.slice(0, 5).map((entry, i) => {
                      const color = categoryColors[entry.category] || "#84CC16";
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.03] p-3"
                          style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
                        >
                          <div className="mt-0.5 shrink-0" style={{ color }}>
                            {categoryIcons[entry.category] || categoryIcons.build}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white/80 leading-snug line-clamp-2">
                              {entry.text}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="text-[10px] font-medium uppercase tracking-wide"
                                style={{ color }}
                              >
                                {entry.category}
                              </span>
                              <span className="text-[10px] text-white/25">
                                {new Date(entry.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="border-t border-white/[0.06] px-6 py-4">
              <a
                href="https://shiplog.co"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 rounded-lg bg-lime-500 text-black font-bold text-sm hover:bg-lime-400 transition"
              >
                Start your journey
              </a>
              <p className="text-center text-[10px] text-white/25 mt-3">
                Powered by{" "}
                <a href="https://screensnap.co" className="text-white/35 hover:text-white/50 transition-colors">
                  ScreenSnap
                </a>
              </p>
            </div>
          </div>

          {/* Info bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <div className="flex flex-col">
              <span className="text-foreground font-medium">
                {journey.user_name} - ShipLog Journey
              </span>
              <span>
                {journey.streak}-day streak · {journey.total_logs} logs
              </span>
            </div>
            <div className="text-right">
              <span className="block">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <div className="w-7 h-7 rounded-full bg-lime-500/20 flex items-center justify-center text-xs text-lime-500">
                {journey.user_name.charAt(0).toUpperCase()}
              </div>
              <span>Shared by {journey.user_name}</span>
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
