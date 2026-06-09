import { formatSettledResult } from "@/lib/team-names";
import type { PredictionChoice } from "@/lib/types";

type SettledResultDisplayProps = {
  settled?: boolean;
  result?: PredictionChoice | null;
  homeTeam: string;
  awayTeam: string;
};

export function SettledResultDisplay({
  settled,
  result,
  homeTeam,
  awayTeam,
}: SettledResultDisplayProps) {
  if (!settled || !result) {
    return null;
  }

  return (
    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
      {formatSettledResult(homeTeam, awayTeam, result)}
    </span>
  );
}
