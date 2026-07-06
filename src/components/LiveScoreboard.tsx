import { getPointsDisplay } from "@/lib/scoring";
import { Match, SetScore } from "@/lib/types";

function formatSetScore(set: SetScore): string {
  if (set.tieBreakLoserPoints === null) {
    return `${set.gamesA}-${set.gamesB}`;
  }
  return set.gamesA === 6
    ? `${set.gamesA}(${set.tieBreakLoserPoints})-${set.gamesB}`
    : `${set.gamesA}-${set.gamesB}(${set.tieBreakLoserPoints})`;
}

export default function LiveScoreboard({ match }: { match: Match }) {
  const { score } = match;
  const display = getPointsDisplay(score);

  return (
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
          teamName={match.teamAName}
          players={match.playersA}
          sets={score.setsA}
          games={score.gamesA}
          pointLabel={
            display.kind === "normal" ? display.a : display.kind === "tiebreak" ? String(display.a) : "–"
          }
        />

        <div className="col-span-3 h-px bg-ink-700" />

        <TeamRow
          accent="clay"
          teamName={match.teamBName}
          players={match.playersB}
          sets={score.setsB}
          games={score.gamesB}
          pointLabel={
            display.kind === "normal" ? display.b : display.kind === "tiebreak" ? String(display.b) : "–"
          }
        />
      </div>

      {(display.kind === "deuce" || display.kind === "advantage") && (
        <div className="mt-4 rounded-lg bg-gold-500/10 py-3 text-center">
          <p className="font-display text-3xl font-bold uppercase tracking-wide text-gold-400">
            {display.kind === "deuce"
              ? "Deuce"
              : `Advantage ${display.team === "A" ? match.teamAName : match.teamBName}`}
          </p>
        </div>
      )}

      {score.setScores.length > 0 && (
        <p className="mt-4 text-center text-sm text-chalk-300">
          {score.setScores.map((set) => formatSetScore(set)).join(", ")}
        </p>
      )}
    </div>
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
  players: string[];
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
