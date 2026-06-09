"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useParticipantSession } from "@/components/ParticipantSessionProvider";
import {
  formatPredictionLabel,
  getPredictionOptions,
} from "@/lib/prediction-labels";
import type { MatchWithPrediction, PredictionChoice } from "@/lib/types";

type PredictionFormProps = {
  match: MatchWithPrediction;
};

export function PredictionForm({ match }: PredictionFormProps) {
  const router = useRouter();
  const { participant } = useParticipantSession();
  const participantId = participant?.id ?? "";
  const predictionOptions = useMemo(
    () => getPredictionOptions(match.home_team, match.away_team),
    [match.home_team, match.away_team],
  );

  const existingPrediction = useMemo(
    () =>
      match.predictions.find(
        (item) => item.participant_id === participantId,
      ) ?? null,
    [match.predictions, participantId],
  );

  const [prediction, setPrediction] = useState<PredictionChoice>(
    () => existingPrediction?.prediction ?? "home",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!participantId) {
      setErrorMessage("参加者が選択されていません");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantId,
          matchId: match.id,
          prediction,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "投票に失敗しました");
      }

      setSuccessMessage(
        existingPrediction ? "予想を更新しました" : "投票しました",
      );
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "投票に失敗しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!match.canVote) {
    return (
      <p className="mt-4 rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-600">
        投票締切のため、投票・変更はできません
      </p>
    );
  }

  if (!participant) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {existingPrediction ? (
        <p className="text-sm text-zinc-700">
          予想：
          {formatPredictionLabel(
            match.home_team,
            match.away_team,
            existingPrediction.prediction,
          )}
        </p>
      ) : null}

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-zinc-700">予想</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {predictionOptions.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-xl border px-3 py-3 text-center text-sm font-medium transition-colors ${
                prediction === option.value
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
              }`}
            >
              <input
                type="radio"
                name={`prediction-${match.id}`}
                value={option.value}
                checked={prediction === option.value}
                onChange={() => setPrediction(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {existingPrediction ? (
        <p className="text-sm text-amber-700">
          この試合は既に投票済みです。変更すると上書きされます。
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !participantId}
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {isSubmitting
          ? "送信中..."
          : existingPrediction
            ? "予想を更新"
            : "投票する"}
      </button>
    </form>
  );
}
