export const PARTICIPANT_ID_STORAGE_KEY = "wc_prediction_participant_id";

export function getStoredParticipantId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(PARTICIPANT_ID_STORAGE_KEY);
}

export function setStoredParticipantId(participantId: string): void {
  window.localStorage.setItem(PARTICIPANT_ID_STORAGE_KEY, participantId);
}

export function clearStoredParticipantId(): void {
  window.localStorage.removeItem(PARTICIPANT_ID_STORAGE_KEY);
}
