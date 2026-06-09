import { AdminHeader } from "@/components/AdminHeader";
import { MatchResultForm } from "@/components/MatchResultForm";
import { getAllMatchesForAdmin } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ResultsAdminPage() {
  const matches = await getAllMatchesForAdmin();

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminHeader
        title="結果入力・精算"
        description="試合結果を確定すると、予想に応じてAが精算されます。"
      />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          <MatchResultForm initialMatches={matches} />
        </section>
      </main>
    </div>
  );
}
