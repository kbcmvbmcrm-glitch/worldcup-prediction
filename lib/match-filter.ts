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
