"use client";

import { useState } from "react";

export function MatchImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setValidationErrors([]);

    if (!file) {
      setErrorMessage("CSVファイルを選択してください");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/matches/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (Array.isArray(result.errors)) {
          setValidationErrors(result.errors);
        }
        throw new Error(result.error ?? "インポートに失敗しました");
      }

      setSuccessMessage(result.message);
      setFile(null);
      event.currentTarget.reset();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "インポートに失敗しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="match-csv"
          className="mb-2 block text-sm font-medium text-zinc-700"
        >
          CSVファイル
        </label>
        <input
          id="match-csv"
          name="file"
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="block w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-emerald-700"
        />
      </div>

      <p className="text-sm text-zinc-500">
        必須カラム: home_team, away_team, kickoff_at, stage, result, settled
        （bet_amount は省略可。空の場合は 500A）
      </p>

      {validationErrors.length > 0 ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-medium">CSVの検証エラー</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
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
        disabled={isSubmitting || !file}
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {isSubmitting ? "インポート中..." : "CSVをインポート"}
      </button>
    </form>
  );
}
