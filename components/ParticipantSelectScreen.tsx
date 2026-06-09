"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AlertMessage } from "@/components/AlertMessage";
import type { Participant } from "@/lib/types";

type ParticipantSelectScreenProps = {
  participants: Participant[];
  onSelect: (participantId: string) => void;
};

export function ParticipantSelectScreen({
  participants,
  onSelect,
}: ParticipantSelectScreenProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(participants[0]?.id ?? "");
  const [showRegisterForm, setShowRegisterForm] = useState(
    participants.length === 0,
  );
  const [registerName, setRegisterName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsRegistering(true);

    try {
      const response = await fetch("/api/participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: registerName }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "参加者の登録に失敗しました");
      }

      onSelect(result.participant.id);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "参加者の登録に失敗しました",
      );
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-zinc-900">参加者を選択</h2>
      <p className="mt-2 text-sm text-zinc-600">
        初回アクセス時に自分の名前を選んでください。この端末では選んだ参加者として投票します。
      </p>

      {errorMessage ? (
        <div className="mt-4">
          <AlertMessage type="error" message={errorMessage} />
        </div>
      ) : null}

      {participants.length > 0 ? (
        <>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {participants.map((participant) => (
              <button
                key={participant.id}
                type="button"
                onClick={() => setSelectedId(participant.id)}
                className={`rounded-xl border px-4 py-4 text-left text-sm font-medium transition-colors ${
                  selectedId === participant.id
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400"
                }`}
              >
                {participant.name}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onSelect(selectedId)}
            disabled={!selectedId}
            className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            この参加者で始める
          </button>
        </>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">
          まだ参加者がいません。下のフォームから自分の名前を登録してください。
        </p>
      )}

      <div className="mt-6 border-t border-zinc-200 pt-6">
        {!showRegisterForm ? (
          <button
            type="button"
            onClick={() => setShowRegisterForm(true)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
          >
            参加者を追加
          </button>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label
                htmlFor="register-name"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                新しい参加者名
              </label>
              <input
                id="register-name"
                type="text"
                value={registerName}
                onChange={(event) => setRegisterName(event.target.value)}
                placeholder="例: Manato"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <button
              type="submit"
              disabled={isRegistering || !registerName.trim()}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {isRegistering ? "登録中..." : "登録して始める"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
