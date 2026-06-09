import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getErrorMessage, toJapaneseDbError } from "@/lib/errors";
import { getParticipants } from "@/lib/queries";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const participants = await getParticipants();
    return NextResponse.json({ participants });
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error, "参加者一覧の取得"),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let body: { name?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエスト形式が不正です" },
      { status: 400 },
    );
  }

  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json(
      { error: "参加者名を入力してください" },
      { status: 400 },
    );
  }

  const { data: existingParticipant, error: existingError } = await supabase
    .from("participants")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json(
      { error: toJapaneseDbError("参加者の確認") },
      { status: 500 },
    );
  }

  if (existingParticipant) {
    return NextResponse.json(
      { error: `「${name}」は既に登録されています` },
      { status: 409 },
    );
  }

  const { data, error } = await supabase
    .from("participants")
    .insert({
      name,
      is_bot: false,
    })
    .select("id, name, is_bot, created_at")
    .single();

  if (error) {
    return NextResponse.json(
      { error: toJapaneseDbError("参加者の登録") },
      { status: 500 },
    );
  }

  revalidatePath("/");
  revalidatePath("/admin/participants");

  return NextResponse.json({ participant: data });
}
