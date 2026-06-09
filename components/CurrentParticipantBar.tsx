"use client";

import { useParticipantSession } from "@/components/ParticipantSessionProvider";

export function CurrentParticipantBar() {
  const { participant, clearSession } = useParticipantSession();

  if (!participant) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
            ログイン中
          </p>
          <p className="mt-1 text-base font-semibold text-emerald-900">
            {participant.name}
          </p>
        </div>
        <button
          type="button"
          onClick={clearSession}
          className="rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100"
        >
          参加者変更
        </button>
      </div>
    </section>
  );
}
