import { NextResponse } from "next/server";

import {
  isAdminAuthenticated,
  isAdminConfigured,
} from "@/lib/admin/auth";

export async function requireAdmin(): Promise<NextResponse | null> {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "管理者パスワードが設定されていません。ADMIN_PASSWORD を環境変数に設定してください。",
      },
      { status: 503 },
    );
  }

  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json(
      { error: "管理者認証が必要です。再度ログインしてください。" },
      { status: 401 },
    );
  }

  return null;
}
