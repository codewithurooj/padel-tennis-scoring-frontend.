"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CopySpectatorLinkButton from "@/components/CopySpectatorLinkButton";
import LiveScoreboard from "@/components/LiveScoreboard";
import PausedBanner from "@/components/PausedBanner";
import { awardPoint } from "@/lib/scoring";
import { getMatch, saveMatch } from "@/lib/match-store";
import { Match, ScoreState, TeamId } from "@/lib/types";

export default function LiveScoringPage() {
  const params = useParams<{ id: string }>();
  const initial = getMatch(params.id);

  const [record, setRecord] = useState<Match | undefined>(initial);
  const [history, setHistory] = useState<ScoreState[]>(initial ? [initial.score] : []);

  useEffect(() => {
    if (record) saveMatch(record);
  }, [record]);

  if (!record) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-3xl font-bold text-chalk-50">Match not found</p>
        <p className="text-chalk-500">It may have been created in a different session.</p>
        <Link
          href="/"
          className="mt-2 min-h-[44px] rounded-full bg-court-500 px-6 py-3 font-display text-lg font-semibold text-ink-950"
        >
          Back to Matches
        </Link>
      </div>
    );
  }

  const isPaused = record.status === "paused";
  const isCompleted = record.status === "completed";
  const winConditionReached = record.score.status === "completed";
  const canScore = record.status === "ongoing" && !winConditionReached;
  const canUndo = record.status === "ongoing" && history.length > 1;
  const canEnd = winConditionReached && !isCompleted;

  function handlePoint(team: TeamId) {
    if (!record || !canScore) return;
    const nextScore = awardPoint(record.score, record.config, team);
    setHistory((h) => [...h, nextScore]);
    setRecord({ ...record, score: nextScore });
  }

  function handleUndo() {
    if (!record || !canUndo) return;
    const nextHistory = history.slice(0, -1);
    setHistory(nextHistory);
    setRecord({ ...record, score: nextHistory[nextHistory.length - 1] });
  }

  function handleTogglePause() {
    if (!record || isCompleted) return;
    setRecord({ ...record, status: isPaused ? "ongoing" : "paused" });
  }

  function handleEnd() {
    if (!record || !canEnd) return;
    setRecord({ ...record, status: "completed" });
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-ink-700 bg-ink-950/95 px-5 pb-3 pt-6 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3">
          <Link
            href="/"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-2xl text-chalk-300 active:bg-ink-800"
            aria-label="Back to matches"
          >
            ‹
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs uppercase tracking-widest text-chalk-500">
              {record.matchName || "Live Scoring"}
            </p>
            <p className="truncate font-display text-lg font-bold text-chalk-50">
              {record.teamAName} <span className="text-chalk-500">vs</span> {record.teamBName}
            </p>
          </div>
          <CopySpectatorLinkButton matchId={record.id} />
          <StatusPill isPaused={isPaused} isCompleted={isCompleted} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 px-5 py-6">
        {isPaused && <PausedBanner />}

        {canEnd && (
          <div className="rounded-xl border border-court-500/50 bg-court-500/10 px-4 py-3 text-center">
            <p className="font-display text-lg font-bold text-court-300">
              {record.score.winner === "A" ? record.teamAName : record.teamBName} won the match
            </p>
            <p className="text-sm text-chalk-300">Tap “End match” to finalize and save to history.</p>
          </div>
        )}

        <LiveScoreboard match={record} />

        <div className="flex-1" />

        {/* Point buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handlePoint("A")}
            disabled={!canScore}
            className="min-h-[64px] rounded-xl bg-court-500 font-display text-xl font-bold text-ink-950 transition-colors active:bg-court-600 disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-chalk-500"
          >
            Point {record.teamAName}
          </button>
          <button
            type="button"
            onClick={() => handlePoint("B")}
            disabled={!canScore}
            className="min-h-[64px] rounded-xl bg-clay-500 font-display text-xl font-bold text-ink-950 transition-colors active:bg-clay-600 disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-chalk-500"
          >
            Point {record.teamBName}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo}
            className="min-h-[44px] rounded-lg border border-ink-600 bg-ink-850 font-semibold text-chalk-200 transition-colors active:bg-ink-800 disabled:cursor-not-allowed disabled:border-ink-700 disabled:text-chalk-700"
          >
            Undo last point
          </button>
          <button
            type="button"
            onClick={handleTogglePause}
            disabled={isCompleted}
            className="min-h-[44px] rounded-lg border border-gold-500/40 bg-gold-500/10 font-semibold text-gold-400 transition-colors active:bg-gold-500/20 disabled:cursor-not-allowed disabled:border-ink-700 disabled:bg-ink-850 disabled:text-chalk-700"
          >
            {isPaused ? "Resume" : "Pause match"}
          </button>
        </div>

        <button
          type="button"
          onClick={handleEnd}
          disabled={!canEnd}
          className="min-h-[44px] rounded-lg border border-danger-500/50 bg-danger-500/10 font-display text-lg font-bold uppercase tracking-wide text-danger-400 transition-colors active:bg-danger-500/20 disabled:cursor-not-allowed disabled:border-ink-700 disabled:bg-ink-850 disabled:text-chalk-700"
        >
          {isCompleted ? "Match Ended" : "End match"}
        </button>
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
