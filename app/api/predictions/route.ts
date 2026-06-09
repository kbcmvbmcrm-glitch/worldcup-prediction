import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { toJapaneseDbError } from "@/lib/errors";
import { getMatchById, getParticipantById } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import type { PredictionChoice } from "@/lib/types";

const VALID_PREDICTIONS: PredictionChoice[] = ["home", "draw", "away"];

type PredictionRequestBody = {
  participantId?: string;
  matchId?: string;
  prediction?: string;
};

export async function POST(request: Request) {
  let body: PredictionRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエスト形式が不正です" },
      { status: 400 },
    );
  }

  const { participantId, matchId, prediction } = body;

  if (!participantId || !matchId || !prediction) {
    return NextResponse.json(
      { error: "participantId, matchId, prediction は必須です" },
      { status: 400 },
    );
  }

  if (!VALID_PREDICTIONS.includes(prediction as PredictionChoice)) {
    return NextResponse.json(
      { error: "prediction は home, draw, away のいずれかです" },
      { status: 400 },
    );
  }

  const participant = await getParticipantById(participantId);

  if (!participant) {
    return NextResponse.json({ error: "参加者が見つかりません" }, { status: 404 });
  }

  if (participant.is_bot) {
    return NextResponse.json({ error: "Botは投票できません" }, { status: 403 });
  }

  const match = await getMatchById(matchId);

  if (!match) {
    return NextResponse.json({ error: "試合が見つかりません" }, { status: 404 });
  }

  if (new Date(match.kickoff_at).getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "この試合は投票締切です。投票・変更はできません。" },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("predictions")
    .upsert(
      {
        participant_id: participantId,
        match_id: matchId,
        prediction,
      },
      { onConflict: "participant_id,match_id" },
    )
    .select("id, participant_id, match_id, prediction")
    .single();

  if (error) {
    return NextResponse.json(
      { error: toJapaneseDbError("投票の保存") },
      { status: 500 },
    );
  }

  revalidatePath("/");

  return NextResponse.json({ prediction: data });
}
