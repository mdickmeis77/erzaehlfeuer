import "server-only";
import { notFound } from "next/navigation";
import { and, asc, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb, schema } from "@/db";
import type { MemberRole } from "@/db/schema";
import { isUuid } from "./campaign";
import { canSeePost, canSeeScene, presentPost } from "./visibility";

async function participantSceneIds(userId: string) {
  const rows = await getDb()
    .select({ sceneId: schema.sceneParticipants.sceneId })
    .from(schema.sceneParticipants)
    .where(eq(schema.sceneParticipants.userId, userId));
  return new Set(rows.map((r) => r.sceneId));
}

// Alle Szenen einer Kampagne, die der Betrachter sehen darf
export async function listVisibleScenes(campaignId: string, viewer: { userId: string; role: MemberRole }) {
  const scenes = await getDb()
    .select()
    .from(schema.scenes)
    .where(eq(schema.scenes.campaignId, campaignId))
    .orderBy(desc(schema.scenes.createdAt));
  const mine = await participantSceneIds(viewer.userId);
  return scenes.filter((s) => canSeeScene(s, { role: viewer.role, isParticipant: mine.has(s.id) }));
}

export async function requireScene(campaignId: string, sceneId: string, viewer: { userId: string; role: MemberRole }) {
  if (!isUuid(sceneId)) notFound();
  const db = getDb();
  const [scene] = await db
    .select()
    .from(schema.scenes)
    .where(and(eq(schema.scenes.id, sceneId), eq(schema.scenes.campaignId, campaignId)));
  if (!scene) notFound();
  const [participant] = await db
    .select()
    .from(schema.sceneParticipants)
    .where(and(eq(schema.sceneParticipants.sceneId, sceneId), eq(schema.sceneParticipants.userId, viewer.userId)));
  if (!canSeeScene(scene, { role: viewer.role, isParticipant: Boolean(participant) })) notFound();
  return scene;
}

export async function listSceneParticipants(sceneId: string) {
  return getDb()
    .select({ userId: schema.users.id, displayName: schema.users.displayName })
    .from(schema.sceneParticipants)
    .innerJoin(schema.users, eq(schema.users.id, schema.sceneParticipants.userId))
    .where(eq(schema.sceneParticipants.sceneId, sceneId));
}

const whisperUser = alias(schema.users, "whisper_user");

// Posts einer Szene – gefiltert und bereinigt nach den Sichtbarkeitsregeln
export async function listVisiblePosts(sceneId: string, viewer: { userId: string; role: MemberRole }) {
  const rows = await getDb()
    .select({
      id: schema.posts.id,
      authorId: schema.posts.authorId,
      authorName: schema.users.displayName,
      asGm: schema.posts.asGm,
      speaker: schema.posts.speaker,
      body: schema.posts.body,
      visibility: schema.posts.visibility,
      whisperTo: schema.posts.whisperTo,
      whisperToName: whisperUser.displayName,
      roll: schema.posts.roll,
      rollHidden: schema.posts.rollHidden,
      createdAt: schema.posts.createdAt,
    })
    .from(schema.posts)
    .innerJoin(schema.users, eq(schema.users.id, schema.posts.authorId))
    .leftJoin(whisperUser, eq(whisperUser.id, schema.posts.whisperTo))
    .where(eq(schema.posts.sceneId, sceneId))
    .orderBy(asc(schema.posts.createdAt));

  return rows.filter((p) => canSeePost(p, viewer)).map((p) => presentPost(p, viewer));
}

export type VisiblePost = Awaited<ReturnType<typeof listVisiblePosts>>[number];
