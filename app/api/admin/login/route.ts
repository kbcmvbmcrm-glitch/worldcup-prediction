import { NextResponse } from "next/server";

import {
  getAdminCookieOptions,
  getAdminSessionToken,
  isAdminConfigured,
  verifyAdminPassword,
} from "@/lib/admin/auth";
import { ADMIN_COOKIE_NAME } from "@/lib/admin/constants";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "管理者パスワードが設定されていません。ADMIN_PASSWORD を環境変数に設定してください。",
      },
      { status: 503 },
    );
  }

  let body: { password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエスト形式が不正です" },
      { status: 400 },
    );
  }

  const password = body.password ?? "";

  if (!password) {
    return NextResponse.json(
      { error: "管理者パスワードを入力してください" },
      { status: 400 },
    );
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json(
      { error: "管理者パスワードが正しくありません" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ message: "管理者としてログインしました" });
  response.cookies.set(
    ADMIN_COOKIE_NAME,
    getAdminSessionToken(),
    getAdminCookieOptions(),
  );

  return response;
}
