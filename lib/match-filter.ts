export type MatchSettledFilter = "all" | "settled" | "unsettled";

export const MATCH_SETTLED_FILTER_OPTIONS: {
  value: MatchSettledFilter;
  label: string;
}[] = [
  { value: "all", label: "全て" },
  { value: "settled", label: "精算済" },
  { value: "unsettled", label: "精算確定前" },
];

export function filterMatchesBySettled<T extends { settled?: boolean }>(
  matches: T[],
  filter: MatchSettledFilter,
): T[] {
  if (filter === "settled") {
    return matches.filter((match) => match.settled === true);
  }

  if (filter === "unsettled") {
    return matches.filter((match) => !match.settled);
  }

  return matches;
}

export function applyMatchSettledFilter<T extends { settled?: boolean }>(
  matches: T[],
  filter: MatchSettledFilter,
): T[] {
  const filtered = filterMatchesBySettled(matches, filter);

  if (filter !== "all") {
    return filtered;
  }

  const unsettled: T[] = [];
  const settled: T[] = [];

  for (const match of filtered) {
    if (match.settled) {
      settled.push(match);
    } else {
      unsettled.push(match);
    }
  }

  return [...unsettled, ...settled];
}
