import Link from "next/link";
import { formatPointsHeadline, formatSetsGames, statusLabel } from "@/lib/format";
import { Match } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  Live: "bg-court-500/15 text-court-300 border-court-500/40",
  Paused: "bg-gold-500/15 text-gold-400 border-gold-500/40",
  Completed: "bg-chalk-500/10 text-chalk-300 border-chalk-500/30",
};

export default function MatchCard({ match }: { match: Match }) {
  const status = statusLabel(match);

  return (
    <Link
      href={`/matches/${match.id}`}
      className="block rounded-xl border border-ink-700 bg-ink-850 px-4 py-4 transition-colors active:bg-ink-800 hover:border-ink-600 min-h-[44px]"
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${STATUS_STYLES[status]}`}
        >
          {status}
        </span>
        <span className="truncate text-xs uppercase tracking-wide text-chalk-500">
          {match.config.matchType === "best-of-1" ? "Best of 1" : "Best of 3"}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-semibold text-court-300">
            {match.teamAName}
          </p>
          <p className="mt-0.5 truncate font-display text-xl font-semibold text-clay-300">
            {match.teamBName}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-2xl font-bold tabular-nums text-chalk-50">
            {match.score.setsA}–{match.score.setsB}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-chalk-300">
        <span>{formatSetsGames(match)}</span>
        <span className="font-semibold text-chalk-100">{formatPointsHeadline(match)}</span>
      </div>
    </Link>
  );
}
