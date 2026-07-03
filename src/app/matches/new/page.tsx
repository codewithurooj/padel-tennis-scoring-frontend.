"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createMatch } from "@/lib/match-store";
import { MatchType } from "@/lib/types";

interface FormState {
  matchName: string;
  teamAName: string;
  playerA1: string;
  playerA2: string;
  teamBName: string;
  playerB1: string;
  playerB2: string;
  matchType: MatchType;
  tieBreakEnabled: boolean;
}

const INITIAL_STATE: FormState = {
  matchName: "",
  teamAName: "",
  playerA1: "",
  playerA2: "",
  teamBName: "",
  playerB1: "",
  playerB2: "",
  matchType: "best-of-3",
  tieBreakEnabled: true,
};

type Errors = Partial<Record<keyof FormState, string>>;

const REQUIRED_FIELDS: { key: keyof FormState; label: string }[] = [
  { key: "teamAName", label: "Team A name" },
  { key: "playerA1", label: "Team A — Player 1 name" },
  { key: "playerA2", label: "Team A — Player 2 name" },
  { key: "teamBName", label: "Team B name" },
  { key: "playerB1", label: "Team B — Player 1 name" },
  { key: "playerB2", label: "Team B — Player 2 name" },
];

function validate(form: FormState): Errors {
  const errors: Errors = {};
  for (const { key, label } of REQUIRED_FIELDS) {
    if (!form[key].toString().trim()) {
      errors[key] = `${label} is required.`;
    }
  }
  return errors;
}

export default function CreateMatchPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Errors>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    const match = createMatch({
      matchName: form.matchName.trim() || undefined,
      teamAName: form.teamAName.trim(),
      teamBName: form.teamBName.trim(),
      playersA: [form.playerA1.trim(), form.playerA2.trim()],
      playersB: [form.playerB1.trim(), form.playerB2.trim()],
      config: { matchType: form.matchType, tieBreakEnabled: form.tieBreakEnabled },
    });

    router.push(`/matches/${match.id}`);
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-ink-700 bg-ink-950/95 px-5 pb-4 pt-6 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl items-center gap-3">
          <Link
            href="/"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-2xl text-chalk-300 active:bg-ink-800"
            aria-label="Back to matches"
          >
            ‹
          </Link>
          <h1 className="font-display text-3xl font-bold text-chalk-50">New Match</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-6">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
          <Field
            label="Match name (optional)"
            value={form.matchName}
            onChange={(v) => update("matchName", v)}
            placeholder="Court 3 · Friday Night League"
          />

          <TeamSection
            accent="court"
            title="Team A"
            teamName={form.teamAName}
            onTeamName={(v) => update("teamAName", v)}
            teamError={errors.teamAName}
            player1={form.playerA1}
            onPlayer1={(v) => update("playerA1", v)}
            player1Error={errors.playerA1}
            player2={form.playerA2}
            onPlayer2={(v) => update("playerA2", v)}
            player2Error={errors.playerA2}
          />

          <TeamSection
            accent="clay"
            title="Team B"
            teamName={form.teamBName}
            onTeamName={(v) => update("teamBName", v)}
            teamError={errors.teamBName}
            player1={form.playerB1}
            onPlayer1={(v) => update("playerB1", v)}
            player1Error={errors.playerB1}
            player2={form.playerB2}
            onPlayer2={(v) => update("playerB2", v)}
            player2Error={errors.playerB2}
          />

          <fieldset>
            <legend className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-chalk-500">
              Match type
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {(["best-of-1", "best-of-3"] as MatchType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => update("matchType", type)}
                  className={`min-h-[44px] rounded-lg border px-4 py-3 font-display text-lg font-semibold transition-colors ${
                    form.matchType === type
                      ? "border-court-500 bg-court-500/15 text-court-300"
                      : "border-ink-700 bg-ink-850 text-chalk-300 active:bg-ink-800"
                  }`}
                >
                  {type === "best-of-1" ? "Best of 1" : "Best of 3"}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex items-center justify-between rounded-lg border border-ink-700 bg-ink-850 px-4 py-3">
            <div>
              <p className="font-semibold text-chalk-100">Tie-break at 6-6</p>
              <p className="text-sm text-chalk-500">
                Off plays uncapped advantage games instead.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.tieBreakEnabled}
              onClick={() => update("tieBreakEnabled", !form.tieBreakEnabled)}
              className={`relative h-8 min-h-[44px] w-14 shrink-0 rounded-full transition-colors ${
                form.tieBreakEnabled ? "bg-court-500" : "bg-ink-600"
              }`}
            >
              <span
                className={`absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-chalk-50 transition-transform ${
                  form.tieBreakEnabled ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <button
            type="submit"
            className="min-h-[44px] rounded-full bg-clay-500 px-6 py-4 font-display text-xl font-bold text-ink-950 transition-colors active:bg-clay-600"
          >
            Start Match
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-chalk-500">
        {label}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-[44px] w-full rounded-lg border bg-ink-850 px-4 py-3 text-chalk-50 outline-none placeholder:text-chalk-700 focus:border-court-400 ${
          error ? "border-danger-500" : "border-ink-700"
        }`}
      />
      {error && (
        <span role="alert" className="mt-1.5 block text-sm font-medium text-danger-400">
          {error}
        </span>
      )}
    </label>
  );
}

function TeamSection({
  accent,
  title,
  teamName,
  onTeamName,
  teamError,
  player1,
  onPlayer1,
  player1Error,
  player2,
  onPlayer2,
  player2Error,
}: {
  accent: "court" | "clay";
  title: string;
  teamName: string;
  onTeamName: (v: string) => void;
  teamError?: string;
  player1: string;
  onPlayer1: (v: string) => void;
  player1Error?: string;
  player2: string;
  onPlayer2: (v: string) => void;
  player2Error?: string;
}) {
  const accentClass = accent === "court" ? "text-court-400" : "text-clay-400";
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-850 p-4">
      <h2 className={`mb-4 font-display text-xl font-bold ${accentClass}`}>{title}</h2>
      <div className="flex flex-col gap-4">
        <Field label="Team name" value={teamName} onChange={onTeamName} error={teamError} />
        <Field label="Player 1 name" value={player1} onChange={onPlayer1} error={player1Error} />
        <Field label="Player 2 name" value={player2} onChange={onPlayer2} error={player2Error} />
      </div>
    </div>
  );
}
