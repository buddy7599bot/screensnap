"use client";

import { useState } from "react";

export default function CopyLinkButton({ url, className }: { url: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button onClick={handleCopy} className={className}>
      {copied ? "✓ Copied" : "Copy link"}
    </button>
  );
}
