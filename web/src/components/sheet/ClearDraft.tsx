"use client";

import { useEffect } from "react";

// Nach dem Erstellen eines Charakters den Entwurf des Assistenten löschen
export function ClearDraft({ campaignId }: { campaignId: string }) {
  useEffect(() => {
    try {
      localStorage.removeItem(`ef-charakter-entwurf-${campaignId}`);
    } catch {
      // egal
    }
  }, [campaignId]);
  return null;
}
