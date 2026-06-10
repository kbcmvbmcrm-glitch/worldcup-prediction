"use client";

import { AdminLinks } from "@/components/AdminLinks";
import { CurrentParticipantBar } from "@/components/CurrentParticipantBar";
import { HomeTabs } from "@/components/HomeTabs";
import { ParticipantSessionProvider } from "@/components/ParticipantSessionProvider";
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
        <HomeTabs
          ranking={ranking}
          matches={matches}
          regularParticipants={regularParticipants}
        />
      </div>
    </ParticipantSessionProvider>
  );
}
