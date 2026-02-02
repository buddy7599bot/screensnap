import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 pt-20 pb-16">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted mb-8">Last updated: February 2026</p>

        <div className="prose-custom space-y-6 text-[var(--foreground-secondary)] leading-relaxed">
          <p>ScreenSnap is a free screenshot sharing tool. This policy explains what data we collect and how we use it. No surprises.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">What we collect</h2>

          <h3 className="text-base font-semibold text-[var(--foreground)]">Account info</h3>
          <p>When you sign in with Google, we receive your name, email, and profile picture. We use this to create your account. We don&apos;t access your Google Drive, contacts, or anything else.</p>

          <h3 className="text-base font-semibold text-[var(--foreground)]">Images you upload</h3>
          <p>Your screenshots are stored in Supabase (our database provider). Each image gets a unique share link. We don&apos;t scan, analyze, or train AI on your images.</p>

          <h3 className="text-base font-semibold text-[var(--foreground)]">Basic analytics</h3>
          <p>We may collect anonymous usage data like page views and feature usage. No personal tracking across other websites.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">Cookies</h2>
          <p>We use cookies to keep you signed in. That&apos;s it. No advertising cookies. No third-party trackers.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">We never sell your data</h2>
          <p>Period. Your data is not sold, rented, or shared with advertisers.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">Image retention</h2>
          <p>Your images stay available as long as your account is active. If you delete an image, it&apos;s removed from our servers. If we shut down the service, we&apos;ll give you notice to download your content.</p>
          <p>We reserve the right to remove images that violate our <Link href="/terms" className="text-rose-500 hover:underline">Terms of Service</Link>.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">Where your data lives</h2>
          <p>Your data is stored on Supabase infrastructure. Supabase uses AWS data centers. Your data may be processed in the United States.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">Your rights (GDPR)</h2>
          <p>If you&apos;re in the EU or UK, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and all associated data</li>
            <li>Export your data</li>
            <li>Object to processing</li>
          </ul>
          <p>To exercise any of these rights, email us and we&apos;ll handle it within 30 days.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">Children</h2>
          <p>ScreenSnap is not intended for children under 13. We don&apos;t knowingly collect data from children.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">Changes</h2>
          <p>If we change this policy, we&apos;ll update the date at the top. For major changes, we&apos;ll notify you via email.</p>
        </div>
      </main>

      <footer className="border-t border-border py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted">
          <Link href="/" className="hover:text-foreground transition">ScreenSnap</Link>
          <span className="hidden sm:inline">·</span>
          <Link href="/terms" className="hover:text-foreground transition">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
