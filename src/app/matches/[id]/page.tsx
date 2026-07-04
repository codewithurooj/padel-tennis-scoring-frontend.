"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { awardPoint, getPointsDisplay } from "@/lib/scoring";
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
  const display = getPointsDisplay(record.score);

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
          <StatusPill isPaused={isPaused} isCompleted={isCompleted} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 px-5 py-6">
        {isPaused && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-gold-500/50 bg-gold-500/10 px-4 py-3">
            <span className="text-xl">⏸</span>
            <span className="font-display text-lg font-bold uppercase tracking-wide text-gold-400">
              Match Paused
            </span>
          </div>
        )}

        {canEnd && (
          <div className="rounded-xl border border-court-500/50 bg-court-500/10 px-4 py-3 text-center">
            <p className="font-display text-lg font-bold text-court-300">
              {record.score.winner === "A" ? record.teamAName : record.teamBName} won the match
            </p>
            <p className="text-sm text-chalk-300">Tap “End match” to finalize and save to history.</p>
          </div>
        )}

        {/* Scoreboard */}
        <div className="rounded-2xl border border-ink-700 bg-ink-900 p-4 sm:p-6">
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 gap-y-2">
            <span />
            <span className="text-center text-[11px] font-bold uppercase tracking-widest text-chalk-500">
              Games
            </span>
            <span className="text-center text-[11px] font-bold uppercase tracking-widest text-chalk-500">
              {display.kind === "tiebreak" ? "Tie-break" : "Points"}
            </span>

            <TeamRow
              accent="court"
              teamName={record.teamAName}
              players={record.playersA}
              sets={record.score.setsA}
              games={record.score.gamesA}
              pointLabel={
                display.kind === "normal"
                  ? display.a
                  : display.kind === "tiebreak"
                    ? String(display.a)
                    : "–"
              }
            />

            <div className="col-span-3 h-px bg-ink-700" />

            <TeamRow
              accent="clay"
              teamName={record.teamBName}
              players={record.playersB}
              sets={record.score.setsB}
              games={record.score.gamesB}
              pointLabel={
                display.kind === "normal"
                  ? display.b
                  : display.kind === "tiebreak"
                    ? String(display.b)
                    : "–"
              }
            />
          </div>

          {(display.kind === "deuce" || display.kind === "advantage") && (
            <div className="mt-4 rounded-lg bg-gold-500/10 py-3 text-center">
              <p className="font-display text-3xl font-bold uppercase tracking-wide text-gold-400">
                {display.kind === "deuce"
                  ? "Deuce"
                  : `Advantage ${display.team === "A" ? record.teamAName : record.teamBName}`}
              </p>
            </div>
          )}
        </div>

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

function TeamRow({
  accent,
  teamName,
  players,
  sets,
  games,
  pointLabel,
}: {
  accent: "court" | "clay";
  teamName: string;
  players: [string, string];
  sets: number;
  games: number;
  pointLabel: string;
}) {
  const nameColor = accent === "court" ? "text-court-300" : "text-clay-300";
  const digitColor = accent === "court" ? "text-court-400" : "text-clay-400";
  return (
    <>
      <div className="min-w-0 text-left">
        <p className={`truncate font-display text-lg font-bold sm:text-xl ${nameColor}`}>
          {teamName}
        </p>
        <p className="truncate text-xs text-chalk-500">{players.join(" / ")}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-chalk-500">
          Sets {sets}
        </p>
      </div>
      <span className={`text-center font-display text-5xl font-bold tabular-nums sm:text-7xl ${digitColor}`}>
        {games}
      </span>
      <span className="text-center font-display text-5xl font-bold tabular-nums text-chalk-50 sm:text-7xl">
        {pointLabel}
      </span>
    </>
  );
}
