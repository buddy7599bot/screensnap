import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 pt-20 pb-16">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted mb-8">Last updated: February 2026</p>

        <div className="prose-custom space-y-6 text-[var(--foreground-secondary)] leading-relaxed">
          <p>These terms apply to your use of ScreenSnap. By using the service, you agree to them.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">What ScreenSnap is</h2>
          <p>ScreenSnap is a free tool for uploading screenshots and generating share links. You upload an image, you get a link, you share it.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">Your account</h2>
          <p>You need a Google account to sign in. You&apos;re responsible for your account activity. Don&apos;t share your login.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">Acceptable use</h2>
          <p>You agree not to upload:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Illegal content of any kind</li>
            <li>NSFW or explicit material</li>
            <li>Content that infringes someone else&apos;s copyright</li>
            <li>Malware or malicious files disguised as images</li>
            <li>Content that harasses or threatens others</li>
          </ul>
          <p>We will remove content that violates these rules. Repeated violations may result in account termination.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">Storage limits</h2>
          <p>Each image upload is limited to 10MB. We may adjust this limit in the future. If we do, we&apos;ll let you know.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">Your content</h2>
          <p>You own what you upload. By using ScreenSnap, you give us permission to store and serve your images so the share links work. That&apos;s the only reason we host your content.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">Our right to remove content</h2>
          <p>We can remove any content at any time, for any reason. We&apos;ll try to be reasonable about it. Typical reasons include policy violations, legal requests, or abuse.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">No warranty</h2>
          <p>ScreenSnap is provided as is. We do our best to keep it running, but we don&apos;t guarantee 100% uptime or that your data will never be lost. Back up anything important.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">Limitation of liability</h2>
          <p>ScreenSnap is free. We are not liable for any damages arising from your use of the service. This includes lost data, downtime, or any other issue. Use the service at your own risk.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">Account termination</h2>
          <p>You can delete your account at any time. We can terminate your account if you violate these terms. On termination, your images and data will be deleted.</p>

          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">Changes to these terms</h2>
          <p>We may update these terms. If we make significant changes, we&apos;ll notify you. Continued use of ScreenSnap means you accept the updated terms.</p>
        </div>
      </main>

      <footer className="border-t border-border py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted">
          <Link href="/" className="hover:text-foreground transition">ScreenSnap</Link>
          <span className="hidden sm:inline">·</span>
          <Link href="/privacy" className="hover:text-foreground transition">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
