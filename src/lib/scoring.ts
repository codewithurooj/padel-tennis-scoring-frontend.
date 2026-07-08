import { MatchConfig, ScoreState, ServerInfo, TeamId } from "./types";

/** Non-tie-break point labels, indexed by raw point count 0-3 (data-model.md PointDisplay). */
const POINT_LABELS = ["Love", "15", "30", "40"] as const;

const SETS_TO_WIN: Record<MatchConfig["matchType"], number> = {
  "best-of-1": 1,
  "best-of-3": 2,
};

export function createInitialScoreState(): ScoreState {
  return {
    pointsA: 0,
    pointsB: 0,
    gamesA: 0,
    gamesB: 0,
    setsA: 0,
    setsB: 0,
    isTieBreak: false,
    status: "ongoing",
    winner: null,
    setScores: [],
  };
}

export type PointsDisplay =
  | { kind: "tiebreak"; a: number; b: number }
  | { kind: "normal"; a: string; b: string }
  | { kind: "deuce" }
  | { kind: "advantage"; team: TeamId };

/** display_points() per data-model.md — Deuce/Advantage depend on both teams' counts together. */
export function getPointsDisplay(score: ScoreState): PointsDisplay {
  if (score.isTieBreak) {
    return { kind: "tiebreak", a: score.pointsA, b: score.pointsB };
  }
  const { pointsA: p, pointsB: o } = score;
  if (p >= 3 && o >= 3) {
    const diff = p - o;
    if (diff === 0) return { kind: "deuce" };
    return { kind: "advantage", team: diff > 0 ? "A" : "B" };
  }
  return { kind: "normal", a: POINT_LABELS[p], b: POINT_LABELS[o] };
}

function winSet(score: ScoreState, config: MatchConfig, winner: TeamId): ScoreState {
  const setsA = score.setsA + (winner === "A" ? 1 : 0);
  const setsB = score.setsB + (winner === "B" ? 1 : 0);
  const setsToWin = SETS_TO_WIN[config.matchType];
  const matchWon = (winner === "A" ? setsA : setsB) >= setsToWin;
  const completedSet = {
    gamesA: score.gamesA,
    gamesB: score.gamesB,
    tieBreakLoserPoints: score.isTieBreak ? Math.min(score.pointsA, score.pointsB) : null,
  };
  return {
    ...score,
    setsA,
    setsB,
    gamesA: 0,
    gamesB: 0,
    pointsA: 0,
    pointsB: 0,
    isTieBreak: false,
    setScores: [...score.setScores, completedSet],
    status: matchWon ? "completed" : "ongoing",
    winner: matchWon ? winner : null,
  };
}

/** Pure state transition mirroring ScoringEngine.award_point() (data-model.md State Transitions). */
export function awardPoint(score: ScoreState, config: MatchConfig, team: TeamId): ScoreState {
  if (score.status === "completed") return score;

  if (score.isTieBreak) {
    const pointsA = score.pointsA + (team === "A" ? 1 : 0);
    const pointsB = score.pointsB + (team === "B" ? 1 : 0);
    const [p, o] = team === "A" ? [pointsA, pointsB] : [pointsB, pointsA];
    if (p >= 7 && p - o >= 2) {
      const gamesA = score.gamesA + (team === "A" ? 1 : 0);
      const gamesB = score.gamesB + (team === "B" ? 1 : 0);
      return winSet({ ...score, pointsA, pointsB, gamesA, gamesB }, config, team);
    }
    return { ...score, pointsA, pointsB };
  }

  const pointsA = score.pointsA + (team === "A" ? 1 : 0);
  const pointsB = score.pointsB + (team === "B" ? 1 : 0);
  const [p, o] = team === "A" ? [pointsA, pointsB] : [pointsB, pointsA];

  if (p >= 4 && p - o >= 2) {
    const gamesA = score.gamesA + (team === "A" ? 1 : 0);
    const gamesB = score.gamesB + (team === "B" ? 1 : 0);
    const next = { ...score, pointsA: 0, pointsB: 0, gamesA, gamesB };

    if (gamesA === 6 && gamesB === 6 && config.tieBreakEnabled) {
      return { ...next, isTieBreak: true };
    }
    if (gamesA >= 6 || gamesB >= 6) {
      const diff = Math.abs(gamesA - gamesB);
      if (diff >= 2) {
        return winSet(next, config, gamesA > gamesB ? "A" : "B");
      }
    }
    return next;
  }

  return { ...score, pointsA, pointsB };
}

/**
 * Derives whose turn it is to serve from completed-game counts alone (mirrors
 * backend's derive_current_server, specs/004-serve-indicator). Singles rotates
 * A/B every game; doubles rotates A1->B1->A2->B2. During a tie-break, serve
 * shifts every 2 points (1 point for the very first), continuing the same order.
 */
export function getCurrentServer(
  score: ScoreState,
  playersA: string[],
  playersB: string[],
): ServerInfo {
  const isDoubles = playersA.length === 2;
  const n = isDoubles ? 4 : 2;

  const completedGames = score.setScores.reduce((sum, set) => sum + set.gamesA + set.gamesB, 0);
  const gamesCompleted = completedGames + score.gamesA + score.gamesB;

  let slot = gamesCompleted % n;
  if (score.isTieBreak) {
    const pointsPlayed = score.pointsA + score.pointsB;
    const offset = Math.ceil(pointsPlayed / 2);
    slot = (slot + offset) % n;
  }

  if (slot < 2) {
    const team: TeamId = slot === 0 ? "A" : "B";
    return { team, playerName: (team === "A" ? playersA : playersB)[0] };
  }
  const team: TeamId = slot === 2 ? "A" : "B";
  return { team, playerName: (team === "A" ? playersA : playersB)[1] };
}
