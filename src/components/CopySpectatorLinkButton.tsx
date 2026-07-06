"use client";

import { useState } from "react";

export default function CopySpectatorLinkButton({ matchId }: { matchId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url = `${window.location.origin}/matches/${matchId}/watch`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex min-h-[44px] items-center justify-center rounded-full border border-ink-700 px-3 text-xs font-semibold uppercase tracking-wide text-chalk-300 active:bg-ink-800"
    >
      {copied ? "Link copied" : "Copy spectator link"}
    </button>
  );
}
