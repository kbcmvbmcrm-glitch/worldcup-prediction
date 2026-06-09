import { getVoteStatusLabels } from "@/lib/prediction-labels";
import {
  buildMatchVoteStatus,
  formatVoteStatusNames,
} from "@/lib/vote-status";
import type { Participant, Prediction } from "@/lib/types";

type VoteStatusSectionProps = {
  homeTeam: string;
  awayTeam: string;
  predictions: Prediction[];
  regularParticipants: Participant[];
};

export function VoteStatusSection({
  homeTeam,
  awayTeam,
  predictions,
  regularParticipants,
}: VoteStatusSectionProps) {
  const labels = getVoteStatusLabels(homeTeam, awayTeam);

  if (regularParticipants.length === 0) {
    return (
      <div className="mt-4 rounded-xl bg-zinc-50 px-4 py-3">
        <h4 className="text-sm font-semibold text-zinc-900">投票状況</h4>
        <p className="mt-2 text-sm text-zinc-500">参加者が登録されていません</p>
      </div>
    );
  }

  const voteStatus = buildMatchVoteStatus(regularParticipants, predictions);

  return (
    <div className="mt-4 rounded-xl bg-zinc-50 px-4 py-3">
      <h4 className="text-sm font-semibold text-zinc-900">投票状況</h4>
      <dl className="mt-3 space-y-2 text-sm text-zinc-700">
        <div className="flex flex-wrap gap-x-2">
          <dt className="shrink-0 font-medium text-zinc-900">
            {labels.home}：
          </dt>
          <dd className="min-w-0 flex-1 break-words">
            {formatVoteStatusNames(voteStatus.home)}
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="shrink-0 font-medium text-zinc-900">
            {labels.draw}：
          </dt>
          <dd className="min-w-0 flex-1 break-words">
            {formatVoteStatusNames(voteStatus.draw)}
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="shrink-0 font-medium text-zinc-900">
            {labels.away}：
          </dt>
          <dd className="min-w-0 flex-1 break-words">
            {formatVoteStatusNames(voteStatus.away)}
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="shrink-0 font-medium text-zinc-900">未投票：</dt>
          <dd className="min-w-0 flex-1 break-words">
            {formatVoteStatusNames(voteStatus.notVoted)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
