import { AdminHeader } from "@/components/AdminHeader";
import { MatchImportForm } from "@/components/MatchImportForm";

export default function MatchImportPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminHeader
        title="試合データ CSVインポート"
        description="matchesテーブルへ試合データを一括登録します。"
      />

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-zinc-900">サンプルCSV</h2>
          <p className="mt-2 text-sm text-zinc-600">
            World Cup 2026 の全104試合データを含むCSVを用意しています。
          </p>
          <a
            href="/data/world-cup-2026-matches.csv"
            download
            className="mt-4 inline-flex rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100"
          >
            world-cup-2026-matches.csv をダウンロード
          </a>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-zinc-900">インポート</h2>
          <div className="mt-4">
            <MatchImportForm />
          </div>
        </section>
      </main>
    </div>
  );
}
