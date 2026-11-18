import "server-only";
import { notFound } from "next/navigation";
import { and, asc, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { MemberRole } from "@/db/schema";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string) => UUID.test(v);

export const ROLE_LABEL: Record<MemberRole, string> = {
  gm: "Spielleitung",
  cogm: "Co-Spielleitung",
  player: "Spieler",
};

export async function getMembership(campaignId: string, userId: string): Promise<MemberRole | null> {
  if (!isUuid(campaignId)) return null;
  const [row] = await getDb()
    .select({ role: schema.campaignMembers.role })
    .from(schema.campaignMembers)
    .where(and(eq(schema.campaignMembers.campaignId, campaignId), eq(schema.campaignMembers.userId, userId)));
  return row?.role ?? null;
}

// Lädt eine Kampagne nur für Mitglieder; für alle anderen sieht es aus, als gäbe es sie nicht
export async function requireCampaign(campaignId: string, userId: string) {
  const role = await getMembership(campaignId, userId);
  if (!role) notFound();
  const [campaign] = await getDb().select().from(schema.campaigns).where(eq(schema.campaigns.id, campaignId));
  if (!campaign) notFound();
  return { campaign, role };
}

export async function listMembers(campaignId: string) {
  return getDb()
    .select({
      userId: schema.users.id,
      displayName: schema.users.displayName,
      role: schema.campaignMembers.role,
    })
    .from(schema.campaignMembers)
    .innerJoin(schema.users, eq(schema.users.id, schema.campaignMembers.userId))
    .where(eq(schema.campaignMembers.campaignId, campaignId))
    .orderBy(asc(schema.campaignMembers.joinedAt));
}

export async function listCampaignsForUser(userId: string) {
  return getDb()
    .select({
      id: schema.campaigns.id,
      name: schema.campaigns.name,
      description: schema.campaigns.description,
      role: schema.campaignMembers.role,
    })
    .from(schema.campaignMembers)
    .innerJoin(schema.campaigns, eq(schema.campaigns.id, schema.campaignMembers.campaignId))
    .where(eq(schema.campaignMembers.userId, userId))
    .orderBy(desc(schema.campaigns.createdAt));
}
