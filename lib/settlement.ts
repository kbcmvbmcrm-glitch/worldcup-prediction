import { getOrCreatePrizeBot } from "@/lib/prize-bot";
import { supabase } from "@/lib/supabase";
import { formatSettlementReason } from "@/lib/team-names";
import type {
  ChipTransactionInsert,
  PredictionChoice,
} from "@/lib/types";

export type SettlementSummary = {
  matchId: string;
  votersCount: number;
  winnersCount: number;
  losersCount: number;
  transactionsCreated: number;
};

type MatchForSettlement = {
  id: string;
  home_team: string;
  away_team: string;
  bet_amount: number;
  settled: boolean;
};

type PredictionRow = {
  participant_id: string;
  prediction: PredictionChoice;
};

type ParticipantFlag = {
  id: string;
  is_bot: boolean;
};

function buildWinnerPayouts(
  winnerCount: number,
  loserCount: number,
  betAmount: number,
): number[] {
  const totalPool = loserCount * betAmount;
  const basePayout = Math.floor(totalPool / winnerCount);
  const remainder = totalPool - basePayout * winnerCount;

  return Array.from({ length: winnerCount }, (_, index) =>
    index < remainder ? basePayout + 1 : basePayout,
  );
}

function buildWinnerSettlementTransactions(
  matchId: string,
  homeTeam: string,
  awayTeam: string,
  betAmount: number,
  result: PredictionChoice,
  predictions: PredictionRow[],
): ChipTransactionInsert[] {
  const winners = predictions.filter((row) => row.prediction === result);
  const losers = predictions.filter((row) => row.prediction !== result);
  const transactions: ChipTransactionInsert[] = [];
  const winReason = formatSettlementReason(homeTeam, awayTeam, "win");
  const loseReason = formatSettlementReason(homeTeam, awayTeam, "lose");
  const payouts = buildWinnerPayouts(winners.length, losers.length, betAmount);

  for (const loser of losers) {
    transactions.push({
      participant_id: loser.participant_id,
      amount: -betAmount,
      reason: loseReason,
      match_id: matchId,
    });
  }

  winners.forEach((winner, index) => {
    transactions.push({
      participant_id: winner.participant_id,
      amount: payouts[index],
      reason: winReason,
      match_id: matchId,
    });
  });

  return transactions;
}

function buildNoWinnerSettlementTransactions(
  matchId: string,
  homeTeam: string,
  awayTeam: string,
  betAmount: number,
  predictions: PredictionRow[],
  prizeBotId: string,
): ChipTransactionInsert[] {
  const loseReason = formatSettlementReason(homeTeam, awayTeam, "lose");
  const noWinnerReason = formatSettlementReason(homeTeam, awayTeam, "no_winner");
  const transactions: ChipTransactionInsert[] = predictions.map((voter) => ({
    participant_id: voter.participant_id,
    amount: -betAmount,
    reason: loseReason,
    match_id: matchId,
  }));

  transactions.push({
    participant_id: prizeBotId,
    amount: predictions.length * betAmount,
    reason: noWinnerReason,
    match_id: matchId,
  });

  return transactions;
}

async function filterRegularVoterPredictions(
  predictions: PredictionRow[],
): Promise<PredictionRow[]> {
  if (predictions.length === 0) {
    return [];
  }

  const participantIds = [...new Set(predictions.map((row) => row.participant_id))];

  const { data: participants, error } = await supabase
    .from("participants")
    .select("id, is_bot")
    .in("id", participantIds);

  if (error) {
    throw new Error(`参加者の取得に失敗しました: ${error.message}`);
  }

  const botIds = new Set(
    ((participants ?? []) as ParticipantFlag[])
      .filter((participant) => participant.is_bot)
      .map((participant) => participant.id),
  );

  return predictions.filter(
    (prediction) => !botIds.has(prediction.participant_id),
  );
}

export async function settleMatch(
  matchId: string,
  result: PredictionChoice,
): Promise<SettlementSummary> {
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, home_team, away_team, bet_amount, settled")
    .eq("id", matchId)
    .maybeSingle();

  if (matchError) {
    throw new Error(`試合の取得に失敗しました: ${matchError.message}`);
  }

  if (!match) {
    throw new Error("試合が見つかりません");
  }

  const matchRow = match as MatchForSettlement;

  if (matchRow.settled) {
    throw new Error("この試合は既に精算済みです");
  }

  const { data: predictions, error: predictionsError } = await supabase
    .from("predictions")
    .select("participant_id, prediction")
    .eq("match_id", matchId);

  if (predictionsError) {
    throw new Error(`予想の取得に失敗しました: ${predictionsError.message}`);
  }

  const predictionRows = await filterRegularVoterPredictions(
    (predictions ?? []) as PredictionRow[],
  );
  const winners = predictionRows.filter((row) => row.prediction === result);
  const losers = predictionRows.filter((row) => row.prediction !== result);

  let transactions: ChipTransactionInsert[] = [];

  if (predictionRows.length === 0) {
    transactions = [];
  } else if (winners.length > 0) {
    transactions = buildWinnerSettlementTransactions(
      matchId,
      matchRow.home_team,
      matchRow.away_team,
      matchRow.bet_amount,
      result,
      predictionRows,
    );
  } else {
    const prizeBotId = await getOrCreatePrizeBot();
    transactions = buildNoWinnerSettlementTransactions(
      matchId,
      matchRow.home_team,
      matchRow.away_team,
      matchRow.bet_amount,
      predictionRows,
      prizeBotId,
    );
  }

  if (transactions.length > 0) {
    const { error: insertError } = await supabase
      .from("chip_transactions")
      .insert(transactions);

    if (insertError) {
      throw new Error(`取引履歴の保存に失敗しました: ${insertError.message}`);
    }
  }

  const { data: updatedMatch, error: updateError } = await supabase
    .from("matches")
    .update({ result, settled: true })
    .eq("id", matchId)
    .eq("settled", false)
    .select("id")
    .maybeSingle();

  if (updateError) {
    throw new Error(`試合結果の更新に失敗しました: ${updateError.message}`);
  }

  if (!updatedMatch) {
    throw new Error("この試合は既に精算済みです");
  }

  return {
    matchId,
    votersCount: predictionRows.length,
    winnersCount: winners.length,
    losersCount: losers.length,
    transactionsCreated: transactions.length,
  };
}

export type UnsettlementSummary = {
  matchId: string;
  deletedTransactions: number;
};

export async function unsettleMatch(
  matchId: string,
): Promise<UnsettlementSummary> {
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, home_team, away_team, settled")
    .eq("id", matchId)
    .maybeSingle();

  if (matchError) {
    throw new Error(`試合の取得に失敗しました: ${matchError.message}`);
  }

  if (!match) {
    throw new Error("試合が見つかりません");
  }

  if (!match.settled) {
    throw new Error("この試合は未精算です");
  }

  const { data: deletedByMatchId, error: deleteByMatchIdError } = await supabase
    .from("chip_transactions")
    .delete()
    .eq("match_id", matchId)
    .select("id");

  if (deleteByMatchIdError) {
    throw new Error(
      `取引履歴の削除に失敗しました: ${deleteByMatchIdError.message}`,
    );
  }

  let deletedTransactions = deletedByMatchId?.length ?? 0;

  if (deletedTransactions === 0) {
    const legacyReasons = [
      formatSettlementReason(match.home_team, match.away_team, "win"),
      formatSettlementReason(match.home_team, match.away_team, "lose"),
      formatSettlementReason(match.home_team, match.away_team, "no_winner"),
    ];

    const { data: deletedByReason, error: deleteByReasonError } = await supabase
      .from("chip_transactions")
      .delete()
      .in("reason", legacyReasons)
      .select("id");

    if (deleteByReasonError) {
      throw new Error(
        `取引履歴の削除に失敗しました: ${deleteByReasonError.message}`,
      );
    }

    deletedTransactions = deletedByReason?.length ?? 0;
  }

  const { data: updatedMatch, error: updateError } = await supabase
    .from("matches")
    .update({ result: null, settled: false })
    .eq("id", matchId)
    .eq("settled", true)
    .select("id")
    .maybeSingle();

  if (updateError) {
    throw new Error(`試合状態の更新に失敗しました: ${updateError.message}`);
  }

  if (!updatedMatch) {
    throw new Error("精算取り消しに失敗しました");
  }

  return {
    matchId,
    deletedTransactions,
  };
}
