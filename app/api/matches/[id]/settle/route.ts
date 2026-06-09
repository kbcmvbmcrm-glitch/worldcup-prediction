import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/require-admin";
import { getErrorMessage } from "@/lib/errors";
import { settleMatch } from "@/lib/settlement";
import type { PredictionChoice } from "@/lib/types";

const VALID_RESULTS: PredictionChoice[] = ["home", "draw", "away"];

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  const { id } = await context.params;

  let body: { result?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエスト形式が不正です" },
      { status: 400 },
    );
  }

  const { result } = body;

  if (!result || !VALID_RESULTS.includes(result as PredictionChoice)) {
    return NextResponse.json(
      { error: "result は home, draw, away のいずれかを指定してください" },
      { status: 400 },
    );
  }

  try {
    const summary = await settleMatch(id, result as PredictionChoice);

    revalidatePath("/");
    revalidatePath("/admin/results");

    return NextResponse.json({
      message: "試合結果を確定し、精算しました",
      summary,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error, "精算"),
      },
      { status: 500 },
    );
  }
}
