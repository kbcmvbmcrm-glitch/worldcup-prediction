import Link from "next/link";

import { ADMIN_ROUTE_LIST } from "@/lib/admin/routes";

export function AdminLinks() {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-zinc-900">管理メニュー</h2>
      <p className="mt-1 text-sm text-zinc-500">
        管理者パスワードが必要です。
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3">
        {ADMIN_ROUTE_LIST.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-center text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
