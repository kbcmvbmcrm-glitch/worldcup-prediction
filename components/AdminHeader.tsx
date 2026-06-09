"use client";

import Link from "next/link";

import { useAdminLogout } from "@/components/AdminAuthGate";

type AdminHeaderProps = {
  title: string;
  description: string;
};

export function AdminHeader({ title, description }: AdminHeaderProps) {
  const logout = useAdminLogout();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← トップに戻る
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            管理者ログアウト
          </button>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-zinc-900">{title}</h1>
        <p className="mt-2 text-sm text-zinc-600">{description}</p>
      </div>
    </header>
  );
}
