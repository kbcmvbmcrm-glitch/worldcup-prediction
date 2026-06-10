"use client";

import { useMemo, useState } from "react";

import { MatchSettledFilterBar } from "@/components/MatchSettledFilterBar";
import { PredictionFormContainer } from "@/components/PredictionFormContainer";
import { SettledResultDisplay } from "@/components/SettledResultDisplay";
import { VoteStatusSection } from "@/components/VoteStatusSection";
import { formatBetAmount } from "@/lib/bet-amount";
import { formatKickoffAt } from "@/lib/format";
import {
  filterMatchesBySettled,
  type MatchSettledFilter,
} from "@/lib/match-filter";
import { formatMatchup } from "@/lib/team-names";
import type { MatchWithPrediction, Participant } from "@/lib/types";

type MatchSectionProps = {
  matches: MatchWithPrediction[];
  regularParticipants: Participant[];
};

export function MatchSection({
  matches,
  regularParticipants,
}: MatchSectionProps) {
  const [settledFilter, setSettledFilter] = useState<MatchSettledFilter>("all");

  const filteredMatches = useMemo(
    () => filterMatchesBySettled(matches, settledFilter),
    [matches, settledFilter],
  );

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-zinc-900">試合一覧</h2>
      <p className="mt-1 text-sm text-zinc-500">
        未開始の試合に投票できます。投票状況は全試合で確認できます。
      </p>

      <div className="mt-4">
        <MatchSettledFilterBar
          value={settledFilter}
          onChange={setSettledFilter}
        />
      </div>

      {matches.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">試合がありません</p>
      ) : filteredMatches.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">該当する試合はありません</p>
      ) : (
        <div className="mt-4 space-y-4">
          {filteredMatches.map((match) => (
            <article
              key={match.id}
              className="rounded-2xl border border-zinc-200 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">
                    {formatMatchup(match.home_team, match.away_team)}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    キックオフ: {formatKickoffAt(match.kickoff_at)}
                  </p>
                  {match.bet_amount != null ? (
                    <p className="mt-1 text-sm font-medium text-zinc-700">
                      ベット：{formatBetAmount(match.bet_amount)}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                      match.canVote
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {match.canVote ? "投票受付中" : "投票締切"}
                  </span>
                  {match.settled ? (
                    <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                      精算済み
                    </span>
                  ) : null}
                  <SettledResultDisplay
                    settled={match.settled}
                    result={match.result}
                    homeTeam={match.home_team}
                    awayTeam={match.away_team}
                  />
                </div>
              </div>

              <VoteStatusSection
                homeTeam={match.home_team}
                awayTeam={match.away_team}
                predictions={match.predictions}
                regularParticipants={regularParticipants}
              />

              {match.canVote ? (
                <PredictionFormContainer match={match} />
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
