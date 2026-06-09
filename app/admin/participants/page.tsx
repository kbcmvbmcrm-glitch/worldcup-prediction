import { AdminHeader } from "@/components/AdminHeader";
import { AdminParticipantSessionReset } from "@/components/AdminParticipantSessionReset";
import { ParticipantAdminForm } from "@/components/ParticipantAdminForm";
import { getParticipants } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ParticipantsAdminPage() {
  const participants = await getParticipants();

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminHeader
        title="参加者管理"
        description="テスト用の参加者を追加・削除できます。"
      />

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <AdminParticipantSessionReset />
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          <ParticipantAdminForm initialParticipants={participants} />
        </section>
      </main>
    </div>
  );
}
