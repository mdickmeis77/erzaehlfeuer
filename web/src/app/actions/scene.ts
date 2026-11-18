"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getMembership } from "@/lib/campaign";
import { DiceError, rollDice, type RollResult } from "@/lib/dice";
import { requireScene } from "@/lib/scene";
import { isGm } from "@/lib/visibility";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function createScene(campaignId: string, fd: FormData) {
  const user = await requireUser();
  if (!isGm(await getMembership(campaignId, user.id))) redirect(`/kampagnen/${campaignId}`);

  const title = str(fd, "title").slice(0, 100);
  if (title.length < 2) redirect(`/kampagnen/${campaignId}/szenen/neu?fehler=titel`);
  const description = str(fd, "description").slice(0, 4000);
  const mode = str(fd, "mode") === "live" ? "live" : "async";
  const visibility = str(fd, "visibility") === "restricted" ? "restricted" : "all";

  const db = getDb();
  const [scene] = await db
    .insert(schema.scenes)
    .values({ campaignId, title, description, mode, visibility })
    .returning({ id: schema.scenes.id });

  if (visibility === "restricted") {
    const requested = fd.getAll("participants").map(String);
    if (requested.length > 0) {
      // Nur echte Mitglieder der Kampagne können Teilnehmer sein
      const members = await db
        .select({ userId: schema.campaignMembers.userId })
        .from(schema.campaignMembers)
        .where(and(eq(schema.campaignMembers.campaignId, campaignId), inArray(schema.campaignMembers.userId, requested)));
      if (members.length > 0) {
        await db.insert(schema.sceneParticipants).values(members.map((m) => ({ sceneId: scene.id, userId: m.userId })));
      }
    }
  }

  redirect(`/kampagnen/${campaignId}/szenen/${scene.id}`);
}

export type PostState = { error?: string; sentAt?: number } | undefined;

export async function createPost(campaignId: string, sceneId: string, _: PostState, fd: FormData): Promise<PostState> {
  const user = await requireUser();
  const role = await getMembership(campaignId, user.id);
  if (!role) return { error: "Du bist kein Mitglied dieser Kampagne." };
  await requireScene(campaignId, sceneId, { userId: user.id, role });
  const gm = isGm(role);

  const body = str(fd, "body").slice(0, 8000);
  const diceInput = str(fd, "dice");
  if (!body && !diceInput) return { error: "Schreib etwas oder gib einen Wurf an." };

  let roll: RollResult | null = null;
  if (diceInput) {
    try {
      roll = rollDice(diceInput);
    } catch (e) {
      if (e instanceof DiceError) return { error: e.message };
      throw e;
    }
  }

  // Optionen der Spielleitung
  const asGm = gm && fd.get("asGm") === "on";
  const speaker = gm ? str(fd, "speaker").slice(0, 60) || null : null;
  const rollHidden = gm && roll !== null && fd.get("rollHidden") === "on";
  const gmNote = gm && fd.get("gmNote") === "on";

  // Flüstern: SL an beliebige Mitglieder, Spieler nur an die Spielleitung
  let whisperTo: string | null = null;
  const target = str(fd, "whisperTo");
  if (target && !gmNote) {
    const targetRole = await getMembership(campaignId, target);
    if (!targetRole || target === user.id) return { error: "Diese Person kann hier nichts empfangen." };
    if (!gm && !isGm(targetRole)) return { error: "Spieler können nur der Spielleitung etwas zuflüstern." };
    whisperTo = target;
  }

  await getDb().insert(schema.posts).values({
    sceneId,
    authorId: user.id,
    asGm: asGm || speaker !== null,
    speaker,
    body,
    visibility: gmNote ? "gm" : whisperTo ? "whisper" : "all",
    whisperTo,
    roll,
    rollHidden,
  });

  revalidatePath(`/kampagnen/${campaignId}/szenen/${sceneId}`);
  return { sentAt: Date.now() };
}
