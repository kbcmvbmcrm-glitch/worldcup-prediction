import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/require-admin";
import { toJapaneseDbError } from "@/lib/errors";
import { isProtectedParticipant } from "@/lib/participants";
import { getParticipantById } from "@/lib/queries";
import { supabase } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function validateParticipantName(
  name: string,
  excludeId?: string,
): Promise<NextResponse | null> {
  if (!name) {
    return NextResponse.json(
      { error: "参加者名を入力してください" },
      { status: 400 },
    );
  }

  let query = supabase.from("participants").select("id").eq("name", name);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data: existingParticipant, error: existingError } =
    await query.maybeSingle();

  if (existingError) {
    return NextResponse.json(
      { error: toJapaneseDbError("参加者名の確認") },
      { status: 500 },
    );
  }

  if (existingParticipant) {
    return NextResponse.json(
      { error: `「${name}」は既に登録されています` },
      { status: 409 },
    );
  }

  return null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  const { id } = await context.params;

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

  const validationError = await validateParticipantName(name, id);

  if (validationError) {
    return validationError;
  }

  const participant = await getParticipantById(id);

  if (!participant) {
    return NextResponse.json(
      { error: "参加者が見つかりません" },
      { status: 404 },
    );
  }

  if (isProtectedParticipant(participant)) {
    return NextResponse.json(
      { error: `「${participant.name}」の名前は変更できません` },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("participants")
    .update({ name })
    .eq("id", id)
    .select("id, name, is_bot, created_at")
    .single();

  if (error) {
    return NextResponse.json(
      { error: toJapaneseDbError("参加者名の更新") },
      { status: 500 },
    );
  }

  revalidatePath("/");
  revalidatePath("/admin/participants");

  return NextResponse.json({
    message: "参加者名を更新しました",
    participant: data,
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  const { id } = await context.params;

  const participant = await getParticipantById(id);

  if (!participant) {
    return NextResponse.json(
      { error: "参加者が見つかりません" },
      { status: 404 },
    );
  }

  if (isProtectedParticipant(participant)) {
    return NextResponse.json(
      { error: `「${participant.name}」は削除できません` },
      { status: 403 },
    );
  }

  const { error } = await supabase.from("participants").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: toJapaneseDbError("参加者の削除") },
      { status: 500 },
    );
  }

  revalidatePath("/");
  revalidatePath("/admin/participants");

  return NextResponse.json({ message: "参加者を削除しました" });
}
