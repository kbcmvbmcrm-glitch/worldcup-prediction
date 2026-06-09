"use client";

import { useState } from "react";

import { AlertMessage } from "@/components/AlertMessage";
import { clearStoredParticipantId } from "@/lib/participant-session";

export function AdminParticipantSessionReset() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleReset = () => {
    const confirmed = window.confirm(
      "この端末に保存されている参加者ログインを解除しますか？\nトップページで再度参加者を選択する必要があります。",
    );

    if (!confirmed) {
      return;
    }

    clearStoredParticipantId();
    setSuccessMessage("この端末の参加者ログインを解除しました。トップページへ移動します。");

    window.setTimeout(() => {
      window.location.href = "/";
    }, 1200);
  };

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-zinc-900">
        参加者セッションリセット
      </h2>
      <p className="mt-2 text-sm text-zinc-700">
        この端末の localStorage に保存された参加者選択を解除します。
        開発・テスト用の機能です。他の参加者の端末には影響しません。
      </p>

      {successMessage ? (
        <div className="mt-4">
          <AlertMessage type="success" message={successMessage} />
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleReset}
        className="mt-4 w-full rounded-xl border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-100"
      >
        この端末の参加者ログインを解除
      </button>
    </section>
  );
}
