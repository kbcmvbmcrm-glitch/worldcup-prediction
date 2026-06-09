import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/require-admin";
import { getErrorMessage } from "@/lib/errors";
import { parseMatchCsv } from "@/lib/match-csv";
import { importMatches } from "@/lib/match-import";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "CSVファイルを選択してください" },
      { status: 400 },
    );
  }

  const csvText = await file.text();
  const { rows, errors } = parseMatchCsv(csvText);

  if (errors.length > 0) {
    return NextResponse.json(
      { error: "CSVの内容に問題があります", errors },
      { status: 400 },
    );
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "CSVにデータ行がありません" },
      { status: 400 },
    );
  }

  try {
    const result = await importMatches(rows);
    revalidatePath("/");
    revalidatePath("/admin/import");

    return NextResponse.json({
      message: `${result.insertedCount}件の試合をインポートしました`,
      insertedCount: result.insertedCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error, "試合データのインポート"),
      },
      { status: 500 },
    );
  }
}
