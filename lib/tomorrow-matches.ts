import type { MatchWithPrediction } from "@/lib/types";

export function getJstTomorrowRange(referenceDate = new Date()): {
  start: Date;
  end: Date;
} {
  const todayJst = referenceDate.toLocaleDateString("en-CA", {
    timeZone: "Asia/Tokyo",
  });
  const [year, month, day] = todayJst.split("-").map(Number);
  const tomorrowCalendar = new Date(year, month - 1, day + 1);
  const tomorrowYear = tomorrowCalendar.getFullYear();
  const tomorrowMonth = tomorrowCalendar.getMonth() + 1;
  const tomorrowDay = tomorrowCalendar.getDate();

  const datePrefix = `${String(tomorrowYear).padStart(4, "0")}-${String(tomorrowMonth).padStart(2, "0")}-${String(tomorrowDay).padStart(2, "0")}`;

  return {
    start: new Date(`${datePrefix}T00:00:00+09:00`),
    end: new Date(`${datePrefix}T23:59:59.999+09:00`),
  };
}

export function countTomorrowUnvotedMatches(
  matches: MatchWithPrediction[],
  participantId: string,
  referenceDate = new Date(),
): number {
  const { start, end } = getJstTomorrowRange(referenceDate);
  const nowMs = referenceDate.getTime();
  const startMs = start.getTime();
  const endMs = end.getTime();

  return matches.filter((match) => {
    if (match.settled) {
      return false;
    }

    const kickoffMs = new Date(match.kickoff_at).getTime();

    if (kickoffMs <= nowMs) {
      return false;
    }

    if (kickoffMs < startMs || kickoffMs > endMs) {
      return false;
    }

    const hasVoted = match.predictions.some(
      (prediction) => prediction.participant_id === participantId,
    );

    return !hasVoted;
  }).length;
}
