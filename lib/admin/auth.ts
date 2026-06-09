import crypto from "crypto";
import { cookies } from "next/headers";

import { ADMIN_COOKIE_NAME } from "@/lib/admin/constants";

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.length);
}

export function getAdminSessionToken(): string {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return crypto
    .createHmac("sha256", password)
    .update("wc-admin-v1")
    .digest("hex");
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return false;
  }

  const provided = Buffer.from(password);
  const expectedBuffer = Buffer.from(expected);

  if (provided.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(provided, expectedBuffer);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!isAdminConfigured()) {
    return false;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return session === getAdminSessionToken();
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
