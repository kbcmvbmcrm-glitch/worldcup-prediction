import { supabase } from "@/lib/supabase";
import type {
  ChipTransaction,
  Match,
  MatchAdmin,
  MatchWithPrediction,
  Participant,
  Prediction,
  RankingEntry,
} from "@/lib/types";

export async function getParticipants(): Promise<Participant[]> {
  const { data, error } = await supabase
    .from("participants")
    .select("id, name, is_bot, created_at")
    .order("name");

  if (error) {
    throw new Error("参加者一覧の取得に失敗しました");
  }

  return data ?? [];
}

export async function getChipTransactions(): Promise<ChipTransaction[]> {
  const { data, error } = await supabase
    .from("chip_transactions")
    .select("id, participant_id, amount");

  if (error) {
    throw new Error("取引履歴の取得に失敗しました");
  }

  return data ?? [];
}

export async function getRanking(): Promise<RankingEntry[]> {
  const [participants, transactions] = await Promise.all([
    getParticipants(),
    getChipTransactions(),
  ]);

  const transactionTotals = new Map<string, number>();

  for (const transaction of transactions) {
    const current = transactionTotals.get(transaction.participant_id) ?? 0;
    transactionTotals.set(
      transaction.participant_id,
      current + transaction.amount,
    );
  }

  const ranked = participants
    .filter((participant) => !participant.is_bot)
    .map((participant) => ({
      participantId: participant.id,
      name: participant.name,
      chips: transactionTotals.get(participant.id) ?? 0,
    }))
    .sort((a, b) => b.chips - a.chips);

  return ranked.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));
}

export async function getUpcomingMatches(): Promise<Match[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("matches")
    .select("id, home_team, away_team, kickoff_at")
    .gt("kickoff_at", now)
    .order("kickoff_at", { ascending: true });

  if (error) {
    throw new Error("試合一覧の取得に失敗しました");
  }

  return data ?? [];
}

export async function getPredictionsForMatches(
  matchIds: string[],
): Promise<Prediction[]> {
  if (matchIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("predictions")
    .select("id, participant_id, match_id, prediction")
    .in("match_id", matchIds);

  if (error) {
    throw new Error("投票状況の取得に失敗しました");
  }

  return data ?? [];
}

export async function getAllMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("id, home_team, away_team, kickoff_at, stage, bet_amount, result, settled")
    .order("kickoff_at", { ascending: true });

  if (error) {
    throw new Error("試合一覧の取得に失敗しました");
  }

  return data ?? [];
}

export async function getMatchesWithPredictions(): Promise<MatchWithPrediction[]> {
  const matches = await getAllMatches();
  const predictions = await getPredictionsForMatches(
    matches.map((match) => match.id),
  );
  const now = Date.now();

  return matches.map((match) => ({
    ...match,
    canVote: new Date(match.kickoff_at).getTime() > now,
    predictions: predictions.filter(
      (prediction) => prediction.match_id === match.id,
    ),
  }));
}

export async function getAllMatchesForAdmin(): Promise<MatchAdmin[]> {
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, home_team, away_team, kickoff_at, stage, bet_amount, result, settled",
    )
    .order("kickoff_at", { ascending: true });

  if (error) {
    throw new Error("試合一覧の取得に失敗しました");
  }

  return data ?? [];
}

export async function getParticipantById(
  participantId: string,
): Promise<Participant | null> {
  const { data, error } = await supabase
    .from("participants")
    .select("id, name, is_bot, created_at")
    .eq("id", participantId)
    .maybeSingle();

  if (error) {
    throw new Error("参加者情報の取得に失敗しました");
  }

  return data;
}

export async function getMatchById(matchId: string): Promise<Match | null> {
  const { data, error } = await supabase
    .from("matches")
    .select("id, home_team, away_team, kickoff_at, settled")
    .eq("id", matchId)
    .maybeSingle();

  if (error) {
    throw new Error("試合情報の取得に失敗しました");
  }

  return data;
}
