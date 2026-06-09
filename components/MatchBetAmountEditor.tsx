"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AlertMessage } from "@/components/AlertMessage";
import {
  formatBetAmount,
  getBetAmountOptions,
} from "@/lib/bet-amount";

type MatchBetAmountEditorProps = {
  matchId: string;
  currentBetAmount: number;
  disabled?: boolean;
  onSaved?: (betAmount: number) => void;
};

export function MatchBetAmountEditor({
  matchId,
  currentBetAmount,
  disabled = false,
  onSaved,
}: MatchBetAmountEditorProps) {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState(currentBetAmount);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const options = getBetAmountOptions(currentBetAmount);

  const handleSave = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/matches/${matchId}/bet-amount`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ betAmount: selectedAmount }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "ベット数の保存に失敗しました");
      }

      setSuccessMessage(`ベット数を ${formatBetAmount(selectedAmount)} に更新しました`);
      onSaved?.(selectedAmount);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "ベット数の保存に失敗しました",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (disabled) {
    return (
      <p className="text-sm text-zinc-600">
        現在ベット：{formatBetAmount(currentBetAmount)}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-600">
        現在ベット：{formatBetAmount(currentBetAmount)}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={selectedAmount}
          onChange={(event) => setSelectedAmount(Number(event.target.value))}
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:max-w-xs"
        >
          {options.map((amount) => (
            <option key={amount} value={amount}>
              {formatBetAmount(amount)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || selectedAmount === currentBetAmount}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {isSaving ? "保存中..." : "保存"}
        </button>
      </div>
      {errorMessage ? <AlertMessage type="error" message={errorMessage} /> : null}
      {successMessage ? (
        <AlertMessage type="success" message={successMessage} />
      ) : null}
    </div>
  );
}
