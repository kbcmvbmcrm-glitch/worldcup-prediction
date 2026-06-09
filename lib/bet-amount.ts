import { formatAmount } from "@/lib/format";

export const BET_AMOUNT_MIN = 500;
export const BET_AMOUNT_STEP = 500;
export const BET_AMOUNT_DEFAULT = 500;
export const BET_AMOUNT_MAX = 10000;

export function isValidBetAmount(amount: number): boolean {
  return (
    Number.isFinite(amount) &&
    amount >= BET_AMOUNT_MIN &&
    amount % BET_AMOUNT_STEP === 0
  );
}

export function getBetAmountOptions(currentAmount?: number): number[] {
  const max = Math.max(
    BET_AMOUNT_MAX,
    currentAmount ?? BET_AMOUNT_DEFAULT,
    BET_AMOUNT_MIN,
  );
  const options: number[] = [];

  for (let amount = BET_AMOUNT_MIN; amount <= max; amount += BET_AMOUNT_STEP) {
    options.push(amount);
  }

  return options;
}

export function formatBetAmount(amount: number): string {
  return formatAmount(amount);
}

export function validateBetAmount(amount: number): string | null {
  if (!Number.isFinite(amount)) {
    return "ベット数が不正です";
  }

  if (amount < BET_AMOUNT_MIN) {
    return `ベット数は${formatAmount(BET_AMOUNT_MIN)}以上で設定してください`;
  }

  if (amount % BET_AMOUNT_STEP !== 0) {
    return `ベット数は${formatAmount(BET_AMOUNT_STEP)}刻みで設定してください`;
  }

  if (amount > BET_AMOUNT_MAX) {
    return `ベット数は${formatAmount(BET_AMOUNT_MAX)}以下で設定してください`;
  }

  return null;
}
