export const PRIZE_BOT_DISPLAY_NAME = "優勝賞金キャリーオーバー";

/** 既存DBの旧名称も検索・保護対象に含める */
export const PRIZE_BOT_LEGACY_NAMES = ["優勝賞金", "優勝賞金Bot"] as const;

export const PRIZE_BOT_NAMES = [
  PRIZE_BOT_DISPLAY_NAME,
  ...PRIZE_BOT_LEGACY_NAMES,
] as const;

export const PRIZE_BOT_CREATE_NAME = PRIZE_BOT_DISPLAY_NAME;
