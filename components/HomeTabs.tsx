"use client";

import { useState } from "react";

import { MatchSection } from "@/components/MatchSection";
import { RankingSection } from "@/components/RankingSection";
import { SettlementHistorySection } from "@/components/SettlementHistorySection";
import type {
  MatchWithPrediction,
  Participant,
  RankingEntry,
  SettlementHistoryEntry,
} from "@/lib/types";

type HomeTab = "vote" | "ranking" | "history";

type HomeTabsProps = {
  ranking: RankingEntry[];
  matches: MatchWithPrediction[];
  regularParticipants: Participant[];
  settlementHistory: SettlementHistoryEntry[];
};

const HOME_TABS: { value: HomeTab; label: string }[] = [
  { value: "vote", label: "投票" },
  { value: "ranking", label: "ランキング" },
  { value: "history", label: "精算履歴" },
];

export function HomeTabs({
  ranking,
  matches,
  regularParticipants,
  settlementHistory,
}: HomeTabsProps) {
  const [activeTab, setActiveTab] = useState<HomeTab>("vote");

  return (
    <div className="space-y-4">
      <div
        className="grid grid-cols-3 gap-2 rounded-2xl border border-zinc-200 bg-zinc-100 p-1.5"
        role="tablist"
        aria-label="メインタブ"
      >
        {HOME_TABS.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-xl px-4 py-3.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {activeTab === "vote" ? (
          <MatchSection
            matches={matches}
            regularParticipants={regularParticipants}
          />
        ) : null}
        {activeTab === "ranking" ? <RankingSection ranking={ranking} /> : null}
        {activeTab === "history" ? (
          <SettlementHistorySection
            entries={settlementHistory}
            regularParticipants={regularParticipants}
          />
        ) : null}
      </div>
    </div>
  );
}
