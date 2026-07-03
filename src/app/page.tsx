"use client";

import Link from "next/link";
import MatchCard from "@/components/MatchCard";
import { listMatches } from "@/lib/match-store";
import { Match } from "@/lib/types";

function splitMatches(matches: Match[]) {
  const ongoing = matches.filter((m) => m.status !== "completed");
  const past = matches.filter((m) => m.status === "completed");
  return { ongoing, past };
}

export default function HomePage() {
  const { ongoing, past } = splitMatches(listMatches());

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-ink-700 bg-ink-950/95 px-5 pb-4 pt-6 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-court-400">
              Courtside
            </p>
            <h1 className="font-display text-3xl font-bold text-chalk-50">Matches</h1>
          </div>
          <Link
            href="/matches/new"
            className="flex min-h-[44px] items-center justify-center rounded-full bg-clay-500 px-5 font-display text-lg font-semibold text-ink-950 transition-colors active:bg-clay-600"
          >
            + New Match
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-6">
        <Section title="Ongoing Matches" emptyLabel="No matches in progress.">
          {ongoing.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </Section>

        <Section title="Past Matches" emptyLabel="No completed matches yet.">
          {past.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </Section>
      </main>
    </div>
  );
}

function Section({
  title,
  emptyLabel,
  children,
}: {
  title: string;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-chalk-500">
        {title}
      </h2>
      {hasChildren ? (
        <div className="flex flex-col gap-3">{children}</div>
      ) : (
        <p className="rounded-xl border border-dashed border-ink-700 px-4 py-6 text-center text-sm text-chalk-500">
          {emptyLabel}
        </p>
      )}
    </section>
  );
}
