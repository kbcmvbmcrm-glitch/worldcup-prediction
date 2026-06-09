import type { MatchVoteStatus, Participant, Prediction } from "@/lib/types";

export function getRegularParticipants(
  participants: Participant[],
): Participant[] {
  return participants.filter((participant) => !participant.is_bot);
}

export function buildMatchVoteStatus(
  regularParticipants: Participant[],
  predictions: Prediction[],
): MatchVoteStatus {
  const participantNameById = new Map(
    regularParticipants.map((participant) => [participant.id, participant.name]),
  );
  const regularParticipantIds = new Set(participantNameById.keys());

  const home: string[] = [];
  const draw: string[] = [];
  const away: string[] = [];
  const votedIds = new Set<string>();

  for (const prediction of predictions) {
    if (!regularParticipantIds.has(prediction.participant_id)) {
      continue;
    }

    const name = participantNameById.get(prediction.participant_id);
    if (!name) {
      continue;
    }

    votedIds.add(prediction.participant_id);

    if (prediction.prediction === "home") {
      home.push(name);
    } else if (prediction.prediction === "draw") {
      draw.push(name);
    } else {
      away.push(name);
    }
  }

  const notVoted = regularParticipants
    .filter((participant) => !votedIds.has(participant.id))
    .map((participant) => participant.name);

  return { home, draw, away, notVoted };
}

export function formatVoteStatusNames(names: string[]): string {
  return names.length > 0 ? names.join("、") : "なし";
}
