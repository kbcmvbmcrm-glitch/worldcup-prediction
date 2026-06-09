"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ParticipantSelectScreen } from "@/components/ParticipantSelectScreen";
import {
  clearStoredParticipantId,
  getStoredParticipantId,
  setStoredParticipantId,
} from "@/lib/participant-session";
import type { Participant } from "@/lib/types";

type ParticipantSessionContextValue = {
  participant: Participant | null;
  isReady: boolean;
  selectParticipant: (participantId: string) => void;
  clearSession: () => void;
};

const ParticipantSessionContext =
  createContext<ParticipantSessionContextValue | null>(null);

type ParticipantSessionProviderProps = {
  participants: Participant[];
  children: React.ReactNode;
};

export function ParticipantSessionProvider({
  participants,
  children,
}: ParticipantSessionProviderProps) {
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedParticipantId = getStoredParticipantId();
    const validParticipant = participants.find(
      (item) => item.id === storedParticipantId,
    );

    queueMicrotask(() => {
      setParticipantId(validParticipant?.id ?? null);
      setIsReady(true);
    });
  }, [participants]);

  const selectParticipant = useCallback((nextParticipantId: string) => {
    setStoredParticipantId(nextParticipantId);
    setParticipantId(nextParticipantId);
  }, []);

  const clearSession = useCallback(() => {
    clearStoredParticipantId();
    setParticipantId(null);
  }, []);

  const participant = useMemo(
    () => participants.find((item) => item.id === participantId) ?? null,
    [participants, participantId],
  );

  const value = useMemo(
    () => ({
      participant,
      isReady,
      selectParticipant,
      clearSession,
    }),
    [participant, isReady, selectParticipant, clearSession],
  );

  if (!isReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500">
        読み込み中...
      </div>
    );
  }

  if (!participant) {
    return (
      <ParticipantSelectScreen
        participants={participants}
        onSelect={selectParticipant}
      />
    );
  }

  return (
    <ParticipantSessionContext.Provider value={value}>
      {children}
    </ParticipantSessionContext.Provider>
  );
}

export function useParticipantSession(): ParticipantSessionContextValue {
  const context = useContext(ParticipantSessionContext);

  if (!context) {
    throw new Error(
      "useParticipantSession must be used within ParticipantSessionProvider",
    );
  }

  return context;
}
