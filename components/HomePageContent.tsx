"use client";

import { AdminLinks } from "@/components/AdminLinks";
import { CurrentParticipantBar } from "@/components/CurrentParticipantBar";
import { HomeTabs } from "@/components/HomeTabs";
import { ParticipantSessionProvider } from "@/components/ParticipantSessionProvider";
import type {
  MatchWithPrediction,
  Participant,
  RankingEntry,
  SettlementHistoryEntry,
} from "@/lib/types";

type HomePageContentProps = {
  ranking: RankingEntry[];
  matches: MatchWithPrediction[];
  regularParticipants: Participant[];
  settlementHistory: SettlementHistoryEntry[];
};

export function HomePageContent({
  ranking,
  matches,
  regularParticipants,
  settlementHistory,
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
          settlementHistory={settlementHistory}
        />
      </div>
    </ParticipantSessionProvider>
  );
}
