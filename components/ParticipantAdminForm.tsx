"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AlertMessage } from "@/components/AlertMessage";
import { isProtectedParticipant } from "@/lib/participants";
import type { Participant } from "@/lib/types";

type ParticipantAdminFormProps = {
  initialParticipants: Participant[];
};

export function ParticipantAdminForm({
  initialParticipants,
}: ParticipantAdminFormProps) {
  const router = useRouter();
  const [participants, setParticipants] =
    useState<Participant[]>(initialParticipants);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "参加者の追加に失敗しました");
      }

      setParticipants((current) =>
        [...current, result.participant].sort((a, b) =>
          a.name.localeCompare(b.name, "ja"),
        ),
      );
      setName("");
      setSuccessMessage(`「${result.participant.name}」を追加しました`);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "参加者の追加に失敗しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (participant: Participant) => {
    setEditingId(participant.id);
    setEditingName(participant.name);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleRename = async (participant: Participant) => {
    const trimmedName = editingName.trim();

    if (!trimmedName) {
      setErrorMessage("参加者名を入力してください");
      return;
    }

    if (trimmedName === participant.name) {
      cancelEditing();
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setRenamingId(participant.id);

    try {
      const response = await fetch(`/api/participants/${participant.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "参加者名の変更に失敗しました");
      }

      setParticipants((current) =>
        current
          .map((item) =>
            item.id === participant.id ? result.participant : item,
          )
          .sort((a, b) => a.name.localeCompare(b.name, "ja")),
      );
      setSuccessMessage(
        `「${participant.name}」を「${result.participant.name}」に変更しました`,
      );
      cancelEditing();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "参加者名の変更に失敗しました",
      );
    } finally {
      setRenamingId(null);
    }
  };

  const handleDelete = async (participant: Participant) => {
    if (isProtectedParticipant(participant)) {
      setErrorMessage(`「${participant.name}」は削除できません`);
      return;
    }

    const confirmed = window.confirm(
      `「${participant.name}」を削除しますか？\n\nこの参加者の投票履歴や取引履歴も削除されます。\nランキングや投票状況に影響します。`,
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setDeletingId(participant.id);

    try {
      const response = await fetch(`/api/participants/${participant.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "参加者の削除に失敗しました");
      }

      setParticipants((current) =>
        current.filter((item) => item.id !== participant.id),
      );
      setSuccessMessage(`「${participant.name}」を削除しました`);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "参加者の削除に失敗しました",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="space-y-4">
        <div>
          <label
            htmlFor="participant-name"
            className="mb-2 block text-sm font-medium text-zinc-700"
          >
            参加者名
          </label>
          <input
            id="participant-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="例: 太郎"
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {isSubmitting ? "追加中..." : "参加者を追加"}
        </button>
      </form>

      {errorMessage ? <AlertMessage type="error" message={errorMessage} /> : null}
      {successMessage ? (
        <AlertMessage type="success" message={successMessage} />
      ) : null}

      <div>
        <h2 className="text-lg font-semibold text-zinc-900">参加者一覧</h2>
        {participants.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">参加者がいません</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {participants.map((participant) => {
              const isProtected = isProtectedParticipant(participant);
              const isEditing = editingId === participant.id;

              return (
                <li
                  key={participant.id}
                  className="rounded-xl border border-zinc-200 px-4 py-3"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                      ) : (
                        <p className="font-medium text-zinc-900">
                          {participant.name}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-zinc-500">
                        {participant.is_bot ? "Bot" : "参加者"}
                        {isProtected ? " / 削除不可" : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRename(participant)}
                            disabled={
                              renamingId === participant.id ||
                              !editingName.trim()
                            }
                            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
                          >
                            {renamingId === participant.id ? "保存中..." : "保存"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <>
                          {!isProtected ? (
                            <button
                              type="button"
                              onClick={() => startEditing(participant)}
                              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                            >
                              名前変更
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => handleDelete(participant)}
                            disabled={
                              isProtected || deletingId === participant.id
                            }
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400"
                          >
                            {deletingId === participant.id ? "削除中..." : "削除"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
