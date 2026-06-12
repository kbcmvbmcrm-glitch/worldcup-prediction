"use client";

import { useMemo } from "react";

import { useParticipantSession } from "@/components/ParticipantSessionProvider";
import { countTomorrowUnvotedMatches } from "@/lib/tomorrow-matches";
import type { MatchWithPrediction } from "@/lib/types";

type TomorrowUnvotedBannerProps = {
  matches: MatchWithPrediction[];
};

export function TomorrowUnvotedBanner({ matches }: TomorrowUnvotedBannerProps) {
  const { participant } = useParticipantSession();

  const unvotedCount = useMemo(() => {
    if (!participant) {
      return 0;
    }

    return countTomorrowUnvotedMatches(matches, participant.id);
  }, [matches, participant]);

  if (!participant) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {unvotedCount > 0 ? (
        <p>
          翌日の未投票試合：
          <span className="font-semibold">{unvotedCount}試合</span>
        </p>
      ) : (
        <p>翌日の未投票試合はありません</p>
      )}
    </div>
  );
}
