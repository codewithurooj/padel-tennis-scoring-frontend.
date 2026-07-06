export type TeamId = "A" | "B";

export type MatchType = "best-of-1" | "best-of-3";

/** App-level match lifecycle. "paused" and "completed" gate scoring per spec FR-006/FR-011. */
export type MatchStatus = "ongoing" | "paused" | "completed";

export interface MatchConfig {
  matchType: MatchType;
  tieBreakEnabled: boolean;
}

/**
 * Mirrors scoring-engine ScoreState (specs/001-scoring-engine/data-model.md).
 * `status`/`winner` here are the engine's own ongoing/completed signal — distinct
 * from Match.status, which adds the "paused" app-level state on top.
 */
export interface SetScore {
  gamesA: number;
  gamesB: number;
  tieBreakLoserPoints: number | null;
}

export interface ScoreState {
  pointsA: number;
  pointsB: number;
  gamesA: number;
  gamesB: number;
  setsA: number;
  setsB: number;
  isTieBreak: boolean;
  status: "ongoing" | "completed";
  winner: TeamId | null;
  setScores: SetScore[];
}

export interface Match {
  id: string;
  matchName?: string;
  teamAName: string;
  teamBName: string;
  playersA: string[];
  playersB: string[];
  config: MatchConfig;
  status: MatchStatus;
  score: ScoreState;
  createdAt: string;
}

export type CreateMatchInput = Omit<Match, "id" | "status" | "score" | "createdAt">;
