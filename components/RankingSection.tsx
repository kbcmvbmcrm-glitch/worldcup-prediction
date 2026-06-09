import { formatChips } from "@/lib/format";
import type { RankingEntry } from "@/lib/types";

type RankingSectionProps = {
  ranking: RankingEntry[];
};

export function RankingSection({ ranking }: RankingSectionProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Aランキング</h2>
      <p className="mt-1 text-sm text-zinc-500">
        取引の累計収支
      </p>

      {ranking.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">参加者がいません</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="pb-2 pr-3 font-medium">順位</th>
                <th className="pb-2 pr-3 font-medium">名前</th>
                <th className="pb-2 font-medium text-right">現在A</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((entry) => (
                <tr
                  key={entry.participantId}
                  className="border-b border-zinc-100 last:border-0"
                >
                  <td className="py-3 pr-3 font-semibold text-zinc-900">
                    {entry.rank}
                  </td>
                  <td className="py-3 pr-3 text-zinc-800">{entry.name}</td>
                  <td className="py-3 text-right font-medium text-emerald-700">
                    {formatChips(entry.chips)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
