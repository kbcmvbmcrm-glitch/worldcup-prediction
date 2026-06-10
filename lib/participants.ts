import {
  PRIZE_BOT_DISPLAY_NAME,
  PRIZE_BOT_NAMES,
} from "@/lib/constants";
import type { Participant } from "@/lib/types";

export function isPrizeBotName(name: string): boolean {
  return (PRIZE_BOT_NAMES as readonly string[]).includes(name);
}

export function getParticipantRoleLabel(
  participant: Pick<Participant, "name" | "is_bot">,
): string {
  if (isPrizeBot(participant)) {
    return "キャリーオーバー";
  }

  if (participant.is_bot) {
    return "Bot";
  }

  return "参加者";
}

export function getPrizeBotDisplayName(): string {
  return PRIZE_BOT_DISPLAY_NAME;
}

export function isPrizeBot(participant: Pick<Participant, "name" | "is_bot">): boolean {
  return participant.is_bot && isPrizeBotName(participant.name);
}

export function isProtectedParticipant(
  participant: Pick<Participant, "name" | "is_bot">,
): boolean {
  return isPrizeBot(participant);
}
