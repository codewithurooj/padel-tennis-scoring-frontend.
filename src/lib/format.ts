import { getPointsDisplay } from "./scoring";
import { Match } from "./types";

/** Compact "sets · games" summary for list cards, e.g. "Sets 1–0 · Games 4–2". */
export function formatSetsGames(match: Match): string {
  const { score } = match;
  return `Sets ${score.setsA}–${score.setsB} · Games ${score.gamesA}–${score.gamesB}`;
}

export function formatPointsHeadline(match: Match): string {
  const display = getPointsDisplay(match.score);
  if (match.score.status === "completed") return "Final";
  if (display.kind === "deuce") return "Deuce";
  if (display.kind === "advantage") {
    return `Advantage ${display.team === "A" ? match.teamAName : match.teamBName}`;
  }
  if (display.kind === "tiebreak") return `Tie-break ${display.a}–${display.b}`;
  return `${display.a}–${display.b}`;
}

export function statusLabel(match: Match): string {
  if (match.status === "paused") return "Paused";
  if (match.status === "completed" || match.score.status === "completed") return "Completed";
  return "Live";
}
