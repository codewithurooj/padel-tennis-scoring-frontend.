"use client";

import { useParams } from "next/navigation";
import LiveScoreboard from "@/components/LiveScoreboard";
import PausedBanner from "@/components/PausedBanner";
import { getMatch } from "@/lib/match-store";

export default function SpectatorPage() {
  const params = useParams<{ id: string }>();
  const match = getMatch(params.id);

  if (!match) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-3xl font-bold text-chalk-50">Match not found</p>
        <p className="text-chalk-500">It may have been created in a different session.</p>
      </div>
    );
  }

  const isPaused = match.status === "paused";

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-ink-700 bg-ink-950/95 px-5 pb-3 pt-6 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs uppercase tracking-widest text-chalk-500">
              {match.matchName || "Spectator View"}
            </p>
          </div>
          <StatusPill isPaused={isPaused} isCompleted={match.status === "completed"} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 px-5 py-6">
        {isPaused && <PausedBanner />}

        <LiveScoreboard match={match} />
      </main>
    </div>
  );
}

function StatusPill({ isPaused, isCompleted }: { isPaused: boolean; isCompleted: boolean }) {
  const label = isCompleted ? "Completed" : isPaused ? "Paused" : "Live";
  const style = isCompleted
    ? "bg-chalk-500/10 text-chalk-300 border-chalk-500/30"
    : isPaused
      ? "bg-gold-500/15 text-gold-400 border-gold-500/40"
      : "bg-court-500/15 text-court-300 border-court-500/40";
  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${style}`}>
      {label}
    </span>
  );
}
