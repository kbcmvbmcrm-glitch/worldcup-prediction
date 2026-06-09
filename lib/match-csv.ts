import { BET_AMOUNT_DEFAULT } from "@/lib/bet-amount";

export const MATCH_CSV_HEADERS = [
  "home_team",
  "away_team",
  "kickoff_at",
  "stage",
  "bet_amount",
  "result",
  "settled",
] as const;

export type MatchCsvRow = {
  home_team: string;
  away_team: string;
  kickoff_at: string;
  stage: string;
  bet_amount: number;
  result: string | null;
  settled: boolean;
};

export type MatchCsvParseResult = {
  rows: MatchCsvRow[];
  errors: string[];
};

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parseBoolean(value: string): boolean {
  const normalized = value.trim().toLowerCase();

  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }

  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }

  throw new Error(`Invalid boolean value: ${value}`);
}

function parseRow(values: string[], lineNumber: number): MatchCsvRow {
  if (values.length !== MATCH_CSV_HEADERS.length) {
    throw new Error(
      `Line ${lineNumber}: expected ${MATCH_CSV_HEADERS.length} columns, got ${values.length}`,
    );
  }

  const [
    home_team,
    away_team,
    kickoff_at,
    stage,
    bet_amount,
    result,
    settled,
  ] = values.map((value) => value.trim());

  if (!home_team || !away_team || !kickoff_at || !stage) {
    throw new Error(`Line ${lineNumber}: required fields cannot be empty`);
  }

  const parsedKickoff = new Date(kickoff_at);
  if (Number.isNaN(parsedKickoff.getTime())) {
    throw new Error(`Line ${lineNumber}: invalid kickoff_at "${kickoff_at}"`);
  }

  let parsedBetAmount: number;

  if (!bet_amount) {
    parsedBetAmount = BET_AMOUNT_DEFAULT;
  } else {
    parsedBetAmount = Number(bet_amount);
    if (!Number.isFinite(parsedBetAmount) || parsedBetAmount < 0) {
      throw new Error(`Line ${lineNumber}: invalid bet_amount "${bet_amount}"`);
    }
  }

  return {
    home_team,
    away_team,
    kickoff_at: parsedKickoff.toISOString(),
    stage,
    bet_amount: parsedBetAmount,
    result: result ? result : null,
    settled: parseBoolean(settled),
  };
}

export function parseMatchCsv(csvText: string): MatchCsvParseResult {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { rows: [], errors: ["CSV file is empty"] };
  }

  const header = parseCsvLine(lines[0]).map((value) => value.trim());
  const expectedHeader = [...MATCH_CSV_HEADERS];

  if (header.join(",") !== expectedHeader.join(",")) {
    return {
      rows: [],
      errors: [
        `Invalid CSV header. Expected: ${expectedHeader.join(", ")}`,
      ],
    };
  }

  const rows: MatchCsvRow[] = [];
  const errors: string[] = [];

  for (let index = 1; index < lines.length; index += 1) {
    try {
      rows.push(parseRow(parseCsvLine(lines[index]), index + 1));
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : `Line ${index + 1}: parse error`,
      );
    }
  }

  return { rows, errors };
}
