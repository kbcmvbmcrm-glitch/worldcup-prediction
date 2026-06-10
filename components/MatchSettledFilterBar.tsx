"use client";

import {
  MATCH_SETTLED_FILTER_OPTIONS,
  type MatchSettledFilter,
} from "@/lib/match-filter";

type MatchSettledFilterBarProps = {
  value: MatchSettledFilter;
  onChange: (value: MatchSettledFilter) => void;
};

export function MatchSettledFilterBar({
  value,
  onChange,
}: MatchSettledFilterBarProps) {
  return (
    <div
      className="grid grid-cols-3 gap-2 rounded-2xl border border-zinc-200 bg-zinc-100 p-1.5"
      role="tablist"
      aria-label="試合ステータスで絞り込み"
    >
      {MATCH_SETTLED_FILTER_OPTIONS.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={`rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
              isActive
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
