import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScreenSnap - Screenshot to Share Link in Seconds",
  description: "Upload or paste a screenshot, get an instant shareable link. Annotate, blur sensitive info, set auto-expiry. The fastest way to share screenshots. $4/mo.",
  openGraph: {
    title: "ScreenSnap - Screenshot to Share Link in Seconds",
    description: "Upload or paste a screenshot, get an instant shareable link.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-surface text-foreground antialiased min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
