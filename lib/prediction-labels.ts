import { translateTeamName } from "@/lib/team-names";
import type { PredictionChoice } from "@/lib/types";

export function formatPredictionLabel(
  homeTeam: string,
  awayTeam: string,
  choice: PredictionChoice,
): string {
  if (choice === "home") {
    return `${translateTeamName(homeTeam)}勝利`;
  }

  if (choice === "draw") {
    return "引き分け";
  }

  return `${translateTeamName(awayTeam)}勝利`;
}

export function getPredictionOptions(
  homeTeam: string,
  awayTeam: string,
): { value: PredictionChoice; label: string }[] {
  return [
    { value: "home", label: formatPredictionLabel(homeTeam, awayTeam, "home") },
    { value: "draw", label: formatPredictionLabel(homeTeam, awayTeam, "draw") },
    { value: "away", label: formatPredictionLabel(homeTeam, awayTeam, "away") },
  ];
}

export function getVoteStatusLabels(homeTeam: string, awayTeam: string) {
  return {
    home: formatPredictionLabel(homeTeam, awayTeam, "home"),
    draw: formatPredictionLabel(homeTeam, awayTeam, "draw"),
    away: formatPredictionLabel(homeTeam, awayTeam, "away"),
  };
}
