import { HomePageContent } from "@/components/HomePageContent";
import {
  getMatchesWithPredictions,
  getParticipants,
  getRanking,
} from "@/lib/queries";
import { getRegularParticipants } from "@/lib/vote-status";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [ranking, matches, participants] = await Promise.all([
    getRanking(),
    getMatchesWithPredictions(),
    getParticipants(),
  ]);
  const regularParticipants = getRegularParticipants(participants);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-emerald-700 bg-emerald-700 text-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <p className="text-sm font-medium text-emerald-100">FIFA World Cup</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            FIFA World Cup 2026 Prediction
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <HomePageContent
          ranking={ranking}
          matches={matches}
          regularParticipants={regularParticipants}
        />
      </main>
    </div>
  );
}
