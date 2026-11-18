import { describe, expect, it } from "vitest";
import { canSeePost, canSeeScene, presentPost } from "./visibility";

const roll = { expression: "1W20", terms: [{ sign: 1 as const, count: 1, sides: 20, rolls: [14] }], modifier: 0, total: 14 };
const post = (over: Partial<Parameters<typeof canSeePost>[0]> = {}) => ({
  authorId: "gm-1",
  visibility: "all" as const,
  whisperTo: null,
  roll: null,
  rollHidden: false,
  ...over,
});

const gm = { userId: "gm-1", role: "gm" as const };
const cogm = { userId: "cogm-1", role: "cogm" as const };
const mira = { userId: "mira", role: "player" as const };
const thorin = { userId: "thorin", role: "player" as const };

describe("canSeePost", () => {
  it("zeigt öffentliche Posts allen", () => {
    expect(canSeePost(post(), mira)).toBe(true);
  });

  it("zeigt SL-Notizen nur der Spielleitung und Co-SL", () => {
    const note = post({ visibility: "gm" });
    expect(canSeePost(note, gm)).toBe(true);
    expect(canSeePost(note, cogm)).toBe(true);
    expect(canSeePost(note, mira)).toBe(false);
  });

  it("zeigt Geflüstertes nur Absender, Empfänger und Spielleitung", () => {
    const whisper = post({ visibility: "whisper", whisperTo: "mira" });
    expect(canSeePost(whisper, mira)).toBe(true);
    expect(canSeePost(whisper, gm)).toBe(true);
    expect(canSeePost(whisper, thorin)).toBe(false);
  });

  it("lässt Spieler ihr eigenes Geflüster an die SL sehen", () => {
    const whisper = post({ authorId: "thorin", visibility: "whisper", whisperTo: "gm-1" });
    expect(canSeePost(whisper, thorin)).toBe(true);
    expect(canSeePost(whisper, mira)).toBe(false);
  });
});

describe("presentPost", () => {
  it("entfernt verdeckte Würfe für Spieler", () => {
    const hidden = post({ roll, rollHidden: true });
    expect(presentPost(hidden, mira).roll).toBeNull();
    expect(presentPost(hidden, gm).roll).toEqual(roll);
    expect(presentPost(hidden, cogm).roll).toEqual(roll);
  });

  it("lässt offene Würfe unverändert", () => {
    expect(presentPost(post({ roll }), mira).roll).toEqual(roll);
  });
});

describe("canSeeScene", () => {
  it("zeigt eingeschränkte Szenen nur Teilnehmern und der Spielleitung", () => {
    const scene = { visibility: "restricted" as const };
    expect(canSeeScene(scene, { role: "player", isParticipant: false })).toBe(false);
    expect(canSeeScene(scene, { role: "player", isParticipant: true })).toBe(true);
    expect(canSeeScene(scene, { role: "gm", isParticipant: false })).toBe(true);
  });
});
