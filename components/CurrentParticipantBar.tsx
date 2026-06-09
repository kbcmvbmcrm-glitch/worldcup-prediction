"use client";

import { useParticipantSession } from "@/components/ParticipantSessionProvider";

export function CurrentParticipantBar() {
  const { participant } = useParticipantSession();

  if (!participant) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
        ログイン中
      </p>
      <p className="mt-1 text-base font-semibold text-emerald-900">
        {participant.name}
      </p>
      <p className="mt-2 text-xs text-emerald-800/80">
        この端末では参加者の変更はできません
      </p>
    </section>
  );
}
