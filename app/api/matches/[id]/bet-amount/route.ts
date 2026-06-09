import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/require-admin";
import { validateBetAmount } from "@/lib/bet-amount";
import { toJapaneseDbError } from "@/lib/errors";
import { supabase } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  const { id } = await context.params;

  let body: { betAmount?: number };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエスト形式が不正です" },
      { status: 400 },
    );
  }

  const betAmount = Number(body.betAmount);
  const validationError = validateBetAmount(betAmount);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, settled")
    .eq("id", id)
    .maybeSingle();

  if (matchError) {
    return NextResponse.json(
      { error: toJapaneseDbError("試合情報の取得") },
      { status: 500 },
    );
  }

  if (!match) {
    return NextResponse.json({ error: "試合が見つかりません" }, { status: 404 });
  }

  if (match.settled) {
    return NextResponse.json(
      { error: "精算済みの試合はベット数を変更できません" },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("matches")
    .update({ bet_amount: betAmount })
    .eq("id", id)
    .eq("settled", false)
    .select("id, bet_amount")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: toJapaneseDbError("ベット数の更新") },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "精算済みの試合はベット数を変更できません" },
      { status: 403 },
    );
  }

  revalidatePath("/");
  revalidatePath("/admin/results");

  return NextResponse.json({
    message: "ベット数を更新しました",
    betAmount: data.bet_amount,
  });
}
