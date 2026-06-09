import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/require-admin";
import { getErrorMessage } from "@/lib/errors";
import { unsettleMatch } from "@/lib/settlement";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  const { id } = await context.params;

  try {
    const summary = await unsettleMatch(id);

    revalidatePath("/");
    revalidatePath("/admin/results");

    return NextResponse.json({
      message: "精算を取り消しました",
      summary,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error, "精算取り消し"),
      },
      { status: 500 },
    );
  }
}
