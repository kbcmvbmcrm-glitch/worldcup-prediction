import { PRIZE_BOT_NAMES } from "@/lib/constants";
import type { Participant } from "@/lib/types";

export function isPrizeBotName(name: string): boolean {
  return (PRIZE_BOT_NAMES as readonly string[]).includes(name);
}

export function isPrizeBot(participant: Pick<Participant, "name" | "is_bot">): boolean {
  return participant.is_bot && isPrizeBotName(participant.name);
}

export function isProtectedParticipant(
  participant: Pick<Participant, "name" | "is_bot">,
): boolean {
  return isPrizeBot(participant);
}
