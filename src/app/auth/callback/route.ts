import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const response = NextResponse.redirect(new URL("/gallery", origin));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => {
            // Parse cookies from the incoming request
            const cookieHeader = request.headers.get("cookie") ?? "";
            return cookieHeader.split(";").map((c) => {
              const [name, ...rest] = c.trim().split("=");
              return { name: name ?? "", value: rest.join("=") };
            }).filter((c) => c.name);
          },
          setAll: (cookies) => {
            for (const { name, value, options } of cookies) {
              response.cookies.set({ name, value, ...options });
            }
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);

    return response;
  }

  return NextResponse.redirect(new URL("/", origin));
}
