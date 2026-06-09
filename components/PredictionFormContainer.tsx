"use client";

import { PredictionForm } from "@/components/PredictionForm";
import { useParticipantSession } from "@/components/ParticipantSessionProvider";
import type { MatchWithPrediction } from "@/lib/types";

type PredictionFormContainerProps = {
  match: MatchWithPrediction;
};

export function PredictionFormContainer({ match }: PredictionFormContainerProps) {
  const { participant } = useParticipantSession();

  return (
    <PredictionForm
      key={`${match.id}-${participant?.id ?? "guest"}-${match.predictions.length}`}
      match={match}
    />
  );
}
