"use client";

import { AdminLinks } from "@/components/AdminLinks";
import { CurrentParticipantBar } from "@/components/CurrentParticipantBar";
import { MatchSection } from "@/components/MatchSection";
import { ParticipantSessionProvider } from "@/components/ParticipantSessionProvider";
import { RankingSection } from "@/components/RankingSection";
import type { MatchWithPrediction, Participant, RankingEntry } from "@/lib/types";

type HomePageContentProps = {
  ranking: RankingEntry[];
  matches: MatchWithPrediction[];
  regularParticipants: Participant[];
};

export function HomePageContent({
  ranking,
  matches,
  regularParticipants,
}: HomePageContentProps) {
  return (
    <ParticipantSessionProvider participants={regularParticipants}>
      <div className="flex flex-col gap-6">
        <CurrentParticipantBar />
        <AdminLinks />
        <RankingSection ranking={ranking} />
        <MatchSection
          matches={matches}
          regularParticipants={regularParticipants}
        />
      </div>
    </ParticipantSessionProvider>
  );
}
