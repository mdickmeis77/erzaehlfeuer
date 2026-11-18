// Sichtbarkeitsregeln aus dem Konzept ("Rollen und Geheimnisse").
// Jede Abfrage, die Posts oder Szenen an Spieler ausliefert, muss durch diese Funktionen.
// Auch die spätere KI darf für Spieler nur Inhalte verwenden, die hier durchgelassen werden.

import type { MemberRole } from "@/db/schema";
import type { RollResult } from "./dice";

export const isGm = (role: MemberRole | null | undefined) => role === "gm" || role === "cogm";

type PostLike = {
  authorId: string;
  visibility: "all" | "gm" | "whisper";
  whisperTo: string | null;
  roll: RollResult | null;
  rollHidden: boolean;
};

type Viewer = { userId: string; role: MemberRole };

export function canSeePost(post: PostLike, viewer: Viewer): boolean {
  if (isGm(viewer.role)) return true;
  switch (post.visibility) {
    case "all":
      return true;
    case "gm":
      return false;
    case "whisper":
      return post.authorId === viewer.userId || post.whisperTo === viewer.userId;
  }
}

// Entfernt verdeckte Würfelergebnisse für Spieler, bevor ein Post ausgeliefert wird
export function presentPost<T extends PostLike>(post: T, viewer: Viewer): T {
  if (post.rollHidden && !isGm(viewer.role) && post.authorId !== viewer.userId) {
    return { ...post, roll: null };
  }
  return post;
}

export function canSeeScene(
  scene: { visibility: "all" | "restricted" },
  viewer: { role: MemberRole; isParticipant: boolean },
): boolean {
  if (isGm(viewer.role)) return true;
  return scene.visibility === "all" || viewer.isParticipant;
}
