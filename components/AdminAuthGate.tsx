"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminLoginForm } from "@/components/AdminLoginForm";
import { ADMIN_CLIENT_SESSION_KEY } from "@/lib/admin/constants";

type AdminAuthGateProps = {
  serverAuthenticated: boolean;
  children: React.ReactNode;
};

function readClientSessionFlag(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return sessionStorage.getItem(ADMIN_CLIENT_SESSION_KEY) === "true";
}

export function AdminAuthGate({
  serverAuthenticated,
  children,
}: AdminAuthGateProps) {
  const [clientReady, setClientReady] = useState(serverAuthenticated);
  const [clientAuthenticated, setClientAuthenticated] =
    useState(serverAuthenticated);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    if (serverAuthenticated) {
      sessionStorage.setItem(ADMIN_CLIENT_SESSION_KEY, "true");
      return;
    }

    const hasClientSession = readClientSessionFlag();

    fetch("/api/admin/session")
      .then((response) => response.json())
      .then((result: { configured?: boolean; authenticated?: boolean }) => {
        setConfigured(result.configured ?? true);

        if (result.authenticated) {
          sessionStorage.setItem(ADMIN_CLIENT_SESSION_KEY, "true");
          setClientAuthenticated(true);
          return;
        }

        if (hasClientSession) {
          sessionStorage.removeItem(ADMIN_CLIENT_SESSION_KEY);
        }

        setClientAuthenticated(false);
      })
      .catch(() => {
        setConfigured(true);
        setClientAuthenticated(hasClientSession);
      })
      .finally(() => {
        setClientReady(true);
      });
  }, [serverAuthenticated]);

  const authenticated = serverAuthenticated || clientAuthenticated;

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
        <section className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          <h1 className="text-lg font-semibold">管理者設定が未完了です</h1>
          <p className="mt-2">
            環境変数 <code>ADMIN_PASSWORD</code> を設定してください。
          </p>
          <Link
            href="/"
            className="mt-4 inline-block font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← トップに戻る
          </Link>
        </section>
      </div>
    );
  }

  if (!clientReady && !serverAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
        <p className="text-sm text-zinc-500">認証状態を確認しています...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-10">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← トップに戻る
          </Link>
        </div>
        <AdminLoginForm />
      </div>
    );
  }

  return <div className="admin-authenticated">{children}</div>;
}

export function useAdminLogout() {
  const router = useRouter();

  return async () => {
    sessionStorage.removeItem(ADMIN_CLIENT_SESSION_KEY);

    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // ログアウト API 失敗時もクライアント側はクリアする
    }

    router.refresh();
  };
}
