import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { toJapaneseDbError } from "@/lib/errors";
import { validatePredictionAccess } from "@/lib/prediction-access";
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

  const access = await validatePredictionAccess(participantId, matchId);

  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
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

export async function DELETE(request: Request) {
  let body: { participantId?: string; matchId?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエスト形式が不正です" },
      { status: 400 },
    );
  }

  const { participantId, matchId } = body;

  if (!participantId || !matchId) {
    return NextResponse.json(
      { error: "participantId, matchId は必須です" },
      { status: 400 },
    );
  }

  const access = await validatePredictionAccess(participantId, matchId);

  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );
  }

  const { data, error } = await supabase
    .from("predictions")
    .delete()
    .eq("participant_id", participantId)
    .eq("match_id", matchId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: toJapaneseDbError("投票の取り消し") },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "取り消す投票が見つかりません" },
      { status: 404 },
    );
  }

  revalidatePath("/");

  return NextResponse.json({ message: "投票を取り消しました" });
}
