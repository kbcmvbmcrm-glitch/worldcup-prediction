import { getMatchById, getParticipantById } from "@/lib/queries";
import type { Match, Participant } from "@/lib/types";

type PredictionAccessSuccess = {
  ok: true;
  participant: Participant;
  match: Match;
};

type PredictionAccessFailure = {
  ok: false;
  error: string;
  status: number;
};

export type PredictionAccessResult =
  | PredictionAccessSuccess
  | PredictionAccessFailure;

export async function validatePredictionAccess(
  participantId: string,
  matchId: string,
): Promise<PredictionAccessResult> {
  const participant = await getParticipantById(participantId);

  if (!participant) {
    return {
      ok: false,
      error: "参加者が見つかりません",
      status: 404,
    };
  }

  if (participant.is_bot) {
    return {
      ok: false,
      error: "Botは投票できません",
      status: 403,
    };
  }

  const match = await getMatchById(matchId);

  if (!match) {
    return {
      ok: false,
      error: "試合が見つかりません",
      status: 404,
    };
  }

  if (match.settled) {
    return {
      ok: false,
      error: "精算済みの試合は投票の変更・取り消しができません",
      status: 403,
    };
  }

  if (new Date(match.kickoff_at).getTime() <= Date.now()) {
    return {
      ok: false,
      error: "この試合は投票締切です。投票・変更・取り消しはできません。",
      status: 403,
    };
  }

  return {
    ok: true,
    participant,
    match,
  };
}
