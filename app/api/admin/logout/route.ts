import { NextResponse } from "next/server";

import { ADMIN_COOKIE_NAME } from "@/lib/admin/constants";

export async function POST() {
  const response = NextResponse.json({ message: "管理者ログアウトしました" });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
