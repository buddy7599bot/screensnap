import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => {
        return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll: (cookies) => {
        try {
          for (const { name, value, options } of cookies) {
            cookieStore.set({ name, value, ...options });
          }
        } catch {
          // Ignore in server components (read-only)
        }
      },
    },
  });
}
