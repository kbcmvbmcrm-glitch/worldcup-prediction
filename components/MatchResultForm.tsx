"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AlertMessage } from "@/components/AlertMessage";
import { MatchBetAmountEditor } from "@/components/MatchBetAmountEditor";
import { MatchSettledFilterBar } from "@/components/MatchSettledFilterBar";
import { SettledResultDisplay } from "@/components/SettledResultDisplay";
import { formatBetAmount } from "@/lib/bet-amount";
import { formatKickoffAt } from "@/lib/format";
import {
  filterMatchesBySettled,
  type MatchSettledFilter,
} from "@/lib/match-filter";
import { formatPredictionLabel, getPredictionOptions } from "@/lib/prediction-labels";
import { formatMatchup } from "@/lib/team-names";
import type { MatchAdmin, PredictionChoice } from "@/lib/types";

type MatchResultFormProps = {
  initialMatches: MatchAdmin[];
};

export function MatchResultForm({ initialMatches }: MatchResultFormProps) {
  const router = useRouter();
  const [matches, setMatches] = useState(initialMatches);
  const [selectedResults, setSelectedResults] = useState<
    Record<string, PredictionChoice>
  >(() =>
    Object.fromEntries(
      initialMatches.map((match) => [
        match.id,
        match.result ?? "home",
      ]),
    ),
  );
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [unsettlingId, setUnsettlingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [settledFilter, setSettledFilter] =
    useState<MatchSettledFilter>("all");

  const unsettledMatches = useMemo(
    () => matches.filter((match) => !match.settled),
    [matches],
  );
  const settledMatches = useMemo(
    () => matches.filter((match) => match.settled),
    [matches],
  );
  const filteredUnsettledMatches = useMemo(
    () => filterMatchesBySettled(unsettledMatches, settledFilter),
    [unsettledMatches, settledFilter],
  );
  const filteredSettledMatches = useMemo(
    () => filterMatchesBySettled(settledMatches, settledFilter),
    [settledMatches, settledFilter],
  );
  const filteredAllMatches = useMemo(
    () => filterMatchesBySettled(matches, settledFilter),
    [matches, settledFilter],
  );

  const handleUnsettle = async (match: MatchAdmin) => {
    const confirmed = window.confirm(
      `${formatMatchup(match.home_team, match.away_team)} の精算を取り消しますか？\n取引履歴は削除され、投票内容は残ります。`,
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setUnsettlingId(match.id);

    try {
      const response = await fetch(`/api/matches/${match.id}/unsettle`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "精算取り消しに失敗しました");
      }

      setMatches((current) =>
        current.map((item) =>
          item.id === match.id
            ? { ...item, result: null, settled: false }
            : item,
        ),
      );

      setSuccessMessage(
        `${formatMatchup(match.home_team, match.away_team)} の精算を取り消しました（削除した履歴 ${result.summary.deletedTransactions}件）`,
      );
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "精算取り消しに失敗しました",
      );
    } finally {
      setUnsettlingId(null);
    }
  };

  const handleSettle = async (match: MatchAdmin) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSettlingId(match.id);

    try {
      const response = await fetch(`/api/matches/${match.id}/settle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          result: selectedResults[match.id],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "結果確定に失敗しました");
      }

      const settledResult = selectedResults[match.id];

      setMatches((current) =>
        current.map((item) =>
          item.id === match.id
            ? { ...item, result: settledResult, settled: true }
            : item,
        ),
      );

      const summary = result.summary;
      setSuccessMessage(
        `${formatMatchup(match.home_team, match.away_team)} を精算しました（投票 ${summary.votersCount}件 / 的中 ${summary.winnersCount}件 / 外れ ${summary.losersCount}件）`,
      );
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "結果確定に失敗しました",
      );
    } finally {
      setSettlingId(null);
    }
  };

  const renderMatchCard = (match: MatchAdmin) => {
    const resultOptions = getPredictionOptions(
      match.home_team,
      match.away_team,
    );
    const isSettled = match.settled;

    return (
      <article
        key={match.id}
        className={`rounded-2xl border p-4 sm:p-5 ${
          isSettled
            ? "border-zinc-300 bg-zinc-100/70"
            : "border-zinc-200 bg-white shadow-sm"
        }`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3
              className={`text-base font-semibold ${
                isSettled ? "text-zinc-700" : "text-zinc-900"
              }`}
            >
              {formatMatchup(match.home_team, match.away_team)}
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              {formatKickoffAt(match.kickoff_at)} / {match.stage}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                isSettled
                  ? "bg-zinc-600 text-white"
                  : "border border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {isSettled ? "精算済み" : "未精算"}
            </span>
            {isSettled && match.result ? (
              <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900">
                {formatPredictionLabel(
                  match.home_team,
                  match.away_team,
                  match.result,
                )}
              </span>
            ) : (
              <SettledResultDisplay
                settled={match.settled}
                result={match.result}
                homeTeam={match.home_team}
                awayTeam={match.away_team}
              />
            )}
          </div>
        </div>

        <div className="mt-4">
          {isSettled ? (
            <p className="text-sm text-zinc-600">
              現在ベット：{formatBetAmount(match.bet_amount)}
            </p>
          ) : (
                  <MatchBetAmountEditor
                    key={`${match.id}-${match.bet_amount}`}
                    matchId={match.id}
                    currentBetAmount={match.bet_amount}
              onSaved={(betAmount) =>
                setMatches((current) =>
                  current.map((item) =>
                    item.id === match.id
                      ? { ...item, bet_amount: betAmount }
                      : item,
                  ),
                )
              }
            />
          )}
        </div>

        {isSettled ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => handleUnsettle(match)}
              disabled={unsettlingId === match.id}
              className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {unsettlingId === match.id ? "取り消し中..." : "精算取消"}
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-zinc-700">
                試合結果
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {resultOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-xl border px-3 py-3 text-center text-sm font-medium transition-colors ${
                      selectedResults[match.id] === option.value
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`result-${match.id}`}
                      value={option.value}
                      checked={selectedResults[match.id] === option.value}
                      onChange={() =>
                        setSelectedResults((current) => ({
                          ...current,
                          [match.id]: option.value,
                        }))
                      }
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={() => handleSettle(match)}
              disabled={settlingId === match.id}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {settlingId === match.id
                ? "精算中..."
                : "結果を確定して精算"}
            </button>
          </div>
        )}
      </article>
    );
  };

  const renderFilteredContent = () => {
    if (settledFilter === "all") {
      return (
        <>
          {filteredUnsettledMatches.length > 0 ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-zinc-900">
                  未精算の試合
                </h2>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                  {filteredUnsettledMatches.length}件
                </span>
              </div>
              <div className="space-y-4">
                {filteredUnsettledMatches.map(renderMatchCard)}
              </div>
            </section>
          ) : (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              未精算の試合はありません
            </p>
          )}

          {filteredSettledMatches.length > 0 ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-zinc-700">
                  精算済みの試合
                </h2>
                <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700">
                  {filteredSettledMatches.length}件
                </span>
              </div>
              <div className="space-y-4">
                {filteredSettledMatches.map(renderMatchCard)}
              </div>
            </section>
          ) : null}
        </>
      );
    }

    if (filteredAllMatches.length === 0) {
      return (
        <p className="text-sm text-zinc-500">該当する試合はありません</p>
      );
    }

    return (
      <div className="space-y-4">
        {filteredAllMatches.map(renderMatchCard)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {errorMessage ? <AlertMessage type="error" message={errorMessage} /> : null}
      {successMessage ? (
        <AlertMessage type="success" message={successMessage} />
      ) : null}

      <MatchSettledFilterBar
        value={settledFilter}
        onChange={setSettledFilter}
      />

      {matches.length === 0 ? (
        <p className="text-sm text-zinc-500">試合がありません</p>
      ) : (
        renderFilteredContent()
      )}
    </div>
  );
}
