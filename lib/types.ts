export type PredictionChoice = "home" | "draw" | "away";

export type Participant = {
  id: string;
  name: string;
  is_bot: boolean;
  created_at: string;
};

export type Match = {
  id: string;
  home_team: string;
  away_team: string;
  kickoff_at: string;
  stage?: string;
  bet_amount?: number;
  result?: PredictionChoice | null;
  settled?: boolean;
};

export type MatchAdmin = {
  id: string;
  home_team: string;
  away_team: string;
  kickoff_at: string;
  stage: string;
  bet_amount: number;
  result: PredictionChoice | null;
  settled: boolean;
};

export type ChipTransactionInsert = {
  participant_id: string;
  amount: number;
  reason: string;
  match_id: string;
};

export type MatchVoteStatus = {
  home: string[];
  draw: string[];
  away: string[];
  notVoted: string[];
};

export type Prediction = {
  id: string;
  participant_id: string;
  match_id: string;
  prediction: PredictionChoice;
};

export type ChipTransaction = {
  id: string;
  participant_id: string;
  amount: number;
};

export type RankingEntry = {
  rank: number;
  participantId: string;
  name: string;
  chips: number;
};

export type MatchWithPrediction = Match & {
  canVote: boolean;
  predictions: Prediction[];
};
