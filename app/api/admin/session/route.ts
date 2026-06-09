import { NextResponse } from "next/server";

import {
  isAdminAuthenticated,
  isAdminConfigured,
} from "@/lib/admin/auth";

export async function GET() {
  if (!isAdminConfigured()) {
    return NextResponse.json({
      configured: false,
      authenticated: false,
    });
  }

  const authenticated = await isAdminAuthenticated();

  return NextResponse.json({
    configured: true,
    authenticated,
  });
}
