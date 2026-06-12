"use client";

import { useMemo, useState } from "react";

import { useParticipantSession } from "@/components/ParticipantSessionProvider";
import {
  formatSettlementDateTime,
  formatSignedAmount,
} from "@/lib/format";
import { formatPredictionLabel } from "@/lib/prediction-labels";
import type { Participant, SettlementHistoryEntry } from "@/lib/types";

type SettlementHistorySectionProps = {
  entries: SettlementHistoryEntry[];
  regularParticipants: Participant[];
};

export function SettlementHistorySection({
  entries,
  regularParticipants,
}: SettlementHistorySectionProps) {
  const { participant } = useParticipantSession();
  const [overrideParticipantId, setOverrideParticipantId] = useState<
    string | null
  >(null);
  const selectedParticipantId =
    overrideParticipantId ??
    participant?.id ??
    regularParticipants[0]?.id ??
    "";

  const selectedParticipant = useMemo(
    () =>
      regularParticipants.find((item) => item.id === selectedParticipantId) ??
      null,
    [regularParticipants, selectedParticipantId],
  );

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => entry.participantId === selectedParticipantId),
    [entries, selectedParticipantId],
  );

  const heading =
    participant?.id === selectedParticipantId
      ? "あなたの履歴"
      : `${selectedParticipant?.name ?? "参加者"}さんの履歴`;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-zinc-900">精算履歴</h2>
      <p className="mt-1 text-sm text-zinc-500">
        参加者ごとの精算履歴を確認できます。
      </p>

      <div className="mt-4">
        <label
          htmlFor="settlement-history-participant"
          className="mb-2 block text-sm font-medium text-zinc-700"
        >
          参加者
        </label>
        <select
          id="settlement-history-participant"
          value={selectedParticipantId}
          onChange={(event) => setOverrideParticipantId(event.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900"
        >
          {regularParticipants.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <h3 className="mt-5 text-base font-semibold text-zinc-900">{heading}</h3>

      {filteredEntries.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">精算履歴はまだありません</p>
      ) : (
        <div className="mt-4 space-y-3">
          {filteredEntries.map((entry) => {
            const resultLabel =
              entry.result && entry.homeTeam && entry.awayTeam
                ? formatPredictionLabel(
                    entry.homeTeam,
                    entry.awayTeam,
                    entry.result,
                  )
                : "—";

            return (
              <article
                key={entry.id}
                className="rounded-xl border border-zinc-200 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-zinc-900">
                      {entry.participantName}
                    </p>
                    <p className="text-sm text-zinc-700">
                      {entry.matchup ?? "試合情報なし"}
                    </p>
                    <p className="text-sm text-zinc-600">
                      確定結果：{resultLabel}
                    </p>
                    {entry.reason ? (
                      <p className="text-sm text-zinc-500">{entry.reason}</p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-base font-semibold ${
                        entry.amount >= 0
                          ? "text-emerald-700"
                          : "text-red-600"
                      }`}
                    >
                      {formatSignedAmount(entry.amount)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatSettlementDateTime(entry.settledAt)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
