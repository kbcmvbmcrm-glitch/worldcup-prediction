import type { MatchCsvRow } from "@/lib/match-csv";
import { supabase } from "@/lib/supabase";

export type MatchImportResult = {
  insertedCount: number;
};

export async function importMatches(
  rows: MatchCsvRow[],
): Promise<MatchImportResult> {
  if (rows.length === 0) {
    throw new Error("No valid rows to import");
  }

  const payload = rows.map((row) => ({
    home_team: row.home_team,
    away_team: row.away_team,
    kickoff_at: row.kickoff_at,
    stage: row.stage,
    bet_amount: row.bet_amount,
    result: row.result,
    settled: row.settled,
  }));

  const { data, error } = await supabase
    .from("matches")
    .insert(payload)
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  return {
    insertedCount: data?.length ?? 0,
  };
}
