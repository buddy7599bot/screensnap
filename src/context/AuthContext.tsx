"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getProfileDefaults(user: User) {
  const metadata = user.user_metadata ?? {};
  const displayName =
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    user.email ||
    "ScreenSnap User";
  const avatarUrl = metadata.avatar_url || metadata.picture || null;
  const username = user.email ? user.email.split("@")[0] : null;

  return { displayName, avatarUrl, username };
}

async function ensureProfile(user: User, supabase: ReturnType<typeof createBrowserSupabaseClient>) {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (data?.id) return;

  const defaults = getProfileDefaults(user);
  await supabase.from("profiles").insert({
    id: user.id,
    display_name: defaults.displayName,
    avatar_url: defaults.avatarUrl,
    username: defaults.username,
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Auth timeout")), 5000)
        );
        const sessionPromise = supabase.auth.getSession();
        const { data: { session }, error } = await Promise.race([sessionPromise, timeout]) as Awaited<typeof sessionPromise>;
        if (!mounted) return;
        if (error) {
          console.error("Auth getSession error:", error);
          setUser(null);
          setLoading(false);
          return;
        }
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);
        if (currentUser) {
          ensureProfile(currentUser, supabase).catch(console.error);
        }
      } catch (e) {
        console.error("Auth loadUser exception:", e);
        if (!mounted) return;
        setUser(null);
        setLoading(false);
      }
    }

    loadUser();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setLoading(false);
      if (nextUser) {
        await ensureProfile(nextUser, supabase);
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
