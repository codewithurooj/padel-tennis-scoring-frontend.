import { createInitialScoreState } from "./scoring";
import { CreateMatchInput, Match, ScoreState } from "./types";

function score(partial: Partial<ScoreState>): ScoreState {
  return { ...createInitialScoreState(), ...partial };
}

/** Hardcoded demo data — no backend/API/database, matches this app's mocked-preview scope. */
const seedMatches: Match[] = [
  {
    id: "demo-live-normal",
    teamAName: "Net Ninjas",
    teamBName: "Smash Bros",
    playersA: ["Amir Khan", "Bilal Chaudhry"],
    playersB: ["Sana Malik", "Hina Riaz"],
    config: { matchType: "best-of-3", tieBreakEnabled: true },
    status: "ongoing",
    score: score({ pointsA: 2, pointsB: 1, gamesA: 3, gamesB: 2, setsA: 0, setsB: 0 }),
    createdAt: "2026-07-02T09:15:00.000Z",
  },
  {
    id: "demo-paused",
    teamAName: "Baseline Bandits",
    teamBName: "Court Crushers",
    playersA: ["Zara Sheikh", "Omar Farooq"],
    playersB: ["Ayesha Noor", "Talha Jamil"],
    config: { matchType: "best-of-3", tieBreakEnabled: true },
    status: "paused",
    score: score({ pointsA: 3, pointsB: 3, gamesA: 4, gamesB: 5, setsA: 1, setsB: 0 }),
    createdAt: "2026-07-02T08:40:00.000Z",
  },
  {
    id: "demo-tiebreak",
    teamAName: "Drop Shot Divas",
    teamBName: "Lob Legends",
    playersA: ["Mahnoor Iqbal", "Fatima Aslam"],
    playersB: ["Rabia Yousaf", "Nida Kamal"],
    config: { matchType: "best-of-1", tieBreakEnabled: true },
    status: "ongoing",
    score: score({ gamesA: 6, gamesB: 6, isTieBreak: true, pointsA: 4, pointsB: 3 }),
    createdAt: "2026-07-02T10:05:00.000Z",
  },
  {
    id: "demo-past-straight",
    teamAName: "Rally Rebels",
    teamBName: "Ace Avengers",
    playersA: ["Junaid Aziz", "Kamran Butt"],
    playersB: ["Saad Rehman", "Usman Tariq"],
    config: { matchType: "best-of-3", tieBreakEnabled: true },
    status: "completed",
    score: score({ setsA: 2, setsB: 0, gamesA: 6, gamesB: 3, status: "completed", winner: "A" }),
    createdAt: "2026-07-01T18:00:00.000Z",
  },
  {
    id: "demo-past-decider",
    teamAName: "Volley Vipers",
    teamBName: "Backhand Bandits",
    playersA: ["Hassan Raza", "Imran Sheikh"],
    playersB: ["Nabeel Anjum", "Waqas Ahmed"],
    config: { matchType: "best-of-3", tieBreakEnabled: false },
    status: "completed",
    score: score({ setsA: 1, setsB: 2, gamesA: 4, gamesB: 6, status: "completed", winner: "B" }),
    createdAt: "2026-06-30T16:30:00.000Z",
  },
];

const store = new Map<string, Match>(seedMatches.map((m) => [m.id, m]));

/** Returns newest-first so freshly created matches surface at the top of the Home lists. */
export function listMatches(): Match[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getMatch(id: string): Match | undefined {
  return store.get(id);
}

export function saveMatch(match: Match): void {
  store.set(match.id, match);
}

export function createMatch(input: CreateMatchInput): Match {
  const id = `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const match: Match = {
    ...input,
    id,
    status: "ongoing",
    score: createInitialScoreState(),
    createdAt: new Date().toISOString(),
  };
  store.set(id, match);
  return match;
}
