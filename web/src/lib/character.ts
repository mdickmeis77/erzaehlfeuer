import "server-only";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { Character, MemberRole } from "@/db/schema";
import { CLASS_BY_ID } from "@/rules/classes";
import { SPECIES_BY_ID } from "@/rules/species";
import { isUuid } from "./campaign";
import { isGm } from "./visibility";

// Den vollständigen Charakterbogen sehen und bearbeiten nur die Besitzerin oder der Besitzer und die Spielleitung.
// Mitspieler sehen in der Runde nur Name, Spezies, Klasse und Stufe.
export const canManageCharacter = (c: Pick<Character, "ownerId">, viewer: { userId: string; role: MemberRole }) =>
  c.ownerId === viewer.userId || isGm(viewer.role);

export function characterSummary(c: Pick<Character, "build" | "level">) {
  const species = SPECIES_BY_ID[c.build.species];
  const option = species?.option?.options.find((o) => o.id === c.build.speciesOption);
  const speciesName = species?.id === "elf" && option ? option.name : (species?.name ?? "?");
  return `${speciesName} · ${CLASS_BY_ID[c.build.class]?.name ?? "?"} · Stufe ${c.level}`;
}

export async function listCharacters(campaignId: string) {
  const rows = await getDb()
    .select({
      id: schema.characters.id,
      name: schema.characters.name,
      ownerId: schema.characters.ownerId,
      ownerName: schema.users.displayName,
      level: schema.characters.level,
      build: schema.characters.build,
    })
    .from(schema.characters)
    .innerJoin(schema.users, eq(schema.users.id, schema.characters.ownerId))
    .where(eq(schema.characters.campaignId, campaignId))
    .orderBy(asc(schema.characters.createdAt));
  return rows.map(({ build, ...r }) => ({ ...r, summary: characterSummary({ build, level: r.level }) }));
}

export async function listOwnCharacters(campaignId: string, userId: string) {
  return getDb()
    .select()
    .from(schema.characters)
    .where(and(eq(schema.characters.campaignId, campaignId), eq(schema.characters.ownerId, userId)))
    .orderBy(asc(schema.characters.createdAt));
}

export async function requireCharacter(campaignId: string, characterId: string, viewer: { userId: string; role: MemberRole }) {
  if (!isUuid(characterId)) notFound();
  const [c] = await getDb()
    .select()
    .from(schema.characters)
    .where(and(eq(schema.characters.id, characterId), eq(schema.characters.campaignId, campaignId)));
  if (!c || !canManageCharacter(c, viewer)) notFound();
  return c;
}
