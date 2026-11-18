"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getMembership } from "@/lib/campaign";
import { isGm } from "@/lib/visibility";

const INVITE_DAYS = 14;
const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function createCampaign(fd: FormData) {
  const user = await requireUser();
  const name = str(fd, "name").slice(0, 80);
  const description = str(fd, "description").slice(0, 2000);
  if (name.length < 2) redirect("/kampagnen/neu?fehler=name");

  const db = getDb();
  const [campaign] = await db
    .insert(schema.campaigns)
    .values({ name, description, createdBy: user.id })
    .returning({ id: schema.campaigns.id });
  await db.insert(schema.campaignMembers).values({ campaignId: campaign.id, userId: user.id, role: "gm" });

  redirect(`/kampagnen/${campaign.id}`);
}

export async function createInvite(campaignId: string) {
  const user = await requireUser();
  if (!isGm(await getMembership(campaignId, user.id))) redirect("/");

  const token = randomBytes(18).toString("base64url");
  await getDb().insert(schema.invites).values({
    token,
    campaignId,
    createdBy: user.id,
    expiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000),
  });
  redirect(`/kampagnen/${campaignId}?einladung=${token}`);
}

export async function acceptInvite(token: string) {
  const user = await requireUser(`/einladung/${token}`);
  const db = getDb();
  const [invite] = await db.select().from(schema.invites).where(eq(schema.invites.token, token));
  if (!invite || invite.expiresAt < new Date()) redirect(`/einladung/${token}`);

  // Wer schon Mitglied ist (z. B. die Spielleitung selbst), behält seine Rolle
  await db
    .insert(schema.campaignMembers)
    .values({ campaignId: invite.campaignId, userId: user.id, role: invite.role })
    .onConflictDoNothing();

  redirect(`/kampagnen/${invite.campaignId}`);
}
