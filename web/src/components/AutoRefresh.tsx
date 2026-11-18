"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Übergangslösung bis zur echten Echtzeit-Verbindung: lädt die Szene regelmäßig neu,
// solange der Tab sichtbar ist.
export function AutoRefresh({ intervalMs }: { intervalMs: number }) {
  const router = useRouter();
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const id = setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router, intervalMs]);
  return null;
}
