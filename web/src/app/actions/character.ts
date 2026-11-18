"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, count, eq, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getMembership, isUuid } from "@/lib/campaign";
import { canManageCharacter } from "@/lib/character";
import { rollDice, withAdvantage } from "@/lib/dice";
import { requireScene } from "@/lib/scene";
import { isGm } from "@/lib/visibility";
import { validateBuild, type CharacterBuild } from "@/rules/build";
import { ABILITY_METHODS, type AbilityMethod } from "@/rules/core";
import { computeSheet } from "@/rules/sheet";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

async function member(campaignId: string) {
  const user = await requireUser();
  if (!isUuid(campaignId)) return null;
  const role = await getMembership(campaignId, user.id);
  return role ? { user, role } : null;
}

async function campaignMethods(campaignId: string): Promise<AbilityMethod[]> {
  const [c] = await getDb().select({ m: schema.campaigns.abilityMethods }).from(schema.campaigns).where(eq(schema.campaigns.id, campaignId));
  return c?.m ?? [];
}

async function managedCharacter(campaignId: string, characterId: string, viewer: { userId: string; role: NonNullable<Awaited<ReturnType<typeof getMembership>>> }) {
  if (!isUuid(characterId)) return null;
  const [c] = await getDb()
    .select()
    .from(schema.characters)
    .where(and(eq(schema.characters.id, characterId), eq(schema.characters.campaignId, campaignId)));
  return c && canManageCharacter(c, viewer) ? c : null;
}

// ---------- Attributswerte würfeln (4W6, niedrigster Würfel fällt weg) ----------

export type AbilityRoll = { rollId: string; values: number[]; details: number[][]; attempt: number } | { error: string };

export async function rollAbilityScores(campaignId: string): Promise<AbilityRoll> {
  const m = await member(campaignId);
  if (!m) return { error: "Du bist kein Mitglied dieser Kampagne." };
  if (!(await campaignMethods(campaignId)).includes("roll")) return { error: "In dieser Kampagne wird nicht gewürfelt." };

  const details = Array.from({ length: 6 }, () => Array.from({ length: 4 }, () => randomInt(1, 7)));
  const values = details.map((d) => [...d].sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a + b, 0));
  const db = getDb();
  const [row] = await db.insert(schema.abilityRolls).values({ campaignId, userId: m.user.id, values, details }).returning({ id: schema.abilityRolls.id });
  const [{ n }] = await db
    .select({ n: count() })
    .from(schema.abilityRolls)
    .where(and(eq(schema.abilityRolls.campaignId, campaignId), eq(schema.abilityRolls.userId, m.user.id)));
  return { rollId: row.id, values, details, attempt: n };
}

// ---------- Charakter anlegen ----------

export type CreateCharacterState = { error?: string; issues?: string[] } | undefined;

export async function createCharacter(campaignId: string, _: CreateCharacterState, fd: FormData): Promise<CreateCharacterState> {
  const m = await member(campaignId);
  if (!m) return { error: "Du bist kein Mitglied dieser Kampagne." };

  const name = str(fd, "name").slice(0, 60);
  if (name.length < 2) return { error: "Gib deinem Charakter einen Namen (mindestens 2 Zeichen)." };
  const appearance = str(fd, "appearance").slice(0, 2000);
  const backstory = str(fd, "backstory").slice(0, 8000);

  let build: CharacterBuild;
  try {
    build = JSON.parse(str(fd, "build"));
  } catch {
    return { error: "Die Auswahl konnte nicht gelesen werden. Lade die Seite neu." };
  }

  const db = getDb();
  let rolledValues: number[] | null = null;
  if (build.abilityMethod === "roll") {
    if (!build.rollId || !isUuid(build.rollId)) return { error: "Würfle zuerst deine Attributswerte." };
    const [roll] = await db
      .select()
      .from(schema.abilityRolls)
      .where(and(eq(schema.abilityRolls.id, build.rollId), eq(schema.abilityRolls.userId, m.user.id), eq(schema.abilityRolls.campaignId, campaignId), isNull(schema.abilityRolls.usedAt)));
    if (!roll) return { error: "Dieser Wurf ist ungültig oder wurde schon verwendet. Würfle neu." };
    rolledValues = roll.values;
  }

  const issues = validateBuild(build, { allowedMethods: await campaignMethods(campaignId), rolledValues });
  if (issues.length > 0) return { error: "Der Charakter ist noch nicht vollständig.", issues: issues.map((i) => i.message) };

  const sheet = computeSheet(build);
  const [created] = await db
    .insert(schema.characters)
    .values({ campaignId, ownerId: m.user.id, name, build, hpCurrent: sheet.hpMax, appearance, backstory })
    .returning({ id: schema.characters.id });
  if (build.rollId) await db.update(schema.abilityRolls).set({ usedAt: new Date() }).where(eq(schema.abilityRolls.id, build.rollId));

  revalidatePath(`/kampagnen/${campaignId}`);
  redirect(`/kampagnen/${campaignId}/charaktere/${created.id}?neu=1`);
}

// ---------- Trefferpunkte und Notizen ----------

export async function updateHitPoints(campaignId: string, characterId: string, fd: FormData) {
  const m = await member(campaignId);
  if (!m) return;
  const c = await managedCharacter(campaignId, characterId, { userId: m.user.id, role: m.role });
  if (!c) return;
  const sheet = computeSheet(c.build, c.level);
  const amount = Math.max(0, Math.min(999, Math.trunc(Number(fd.get("amount")) || 0)));
  const op = str(fd, "op");

  let { hpCurrent, hpTemp } = c;
  if (op === "damage") {
    const absorbed = Math.min(hpTemp, amount);
    hpTemp -= absorbed;
    hpCurrent = Math.max(0, hpCurrent - (amount - absorbed));
  } else if (op === "heal") {
    hpCurrent = Math.min(sheet.hpMax, hpCurrent + amount);
  } else if (op === "temp") {
    hpTemp = amount; // temporäre TP addieren sich nicht, der höhere Wert zählt – hier wird gesetzt
  } else if (op === "rest") {
    hpCurrent = sheet.hpMax;
    hpTemp = 0;
  } else {
    return;
  }
  await getDb().update(schema.characters).set({ hpCurrent, hpTemp, updatedAt: new Date() }).where(eq(schema.characters.id, c.id));
  revalidatePath(`/kampagnen/${campaignId}/charaktere/${c.id}`);
}

export async function updateCharacterNotes(campaignId: string, characterId: string, fd: FormData) {
  const m = await member(campaignId);
  if (!m) return;
  const c = await managedCharacter(campaignId, characterId, { userId: m.user.id, role: m.role });
  if (!c) return;
  const name = str(fd, "name").slice(0, 60);
  await getDb()
    .update(schema.characters)
    .set({
      name: name.length >= 2 ? name : c.name,
      appearance: str(fd, "appearance").slice(0, 2000),
      backstory: str(fd, "backstory").slice(0, 8000),
      updatedAt: new Date(),
    })
    .where(eq(schema.characters.id, c.id));
  revalidatePath(`/kampagnen/${campaignId}/charaktere/${c.id}`);
}

export async function deleteCharacter(campaignId: string, characterId: string, fd: FormData) {
  const m = await member(campaignId);
  if (!m) return;
  const c = await managedCharacter(campaignId, characterId, { userId: m.user.id, role: m.role });
  if (!c) return;
  if (str(fd, "confirm") !== c.name) redirect(`/kampagnen/${campaignId}/charaktere/${c.id}?loeschen=falsch`);
  await getDb().delete(schema.characters).where(eq(schema.characters.id, c.id));
  revalidatePath(`/kampagnen/${campaignId}`);
  redirect(`/kampagnen/${campaignId}`);
}

// ---------- Würfeln vom Charakterbogen in eine Szene ----------

export type CheckRollState = { error?: string; sentAt?: number; total?: number; label?: string } | undefined;

export async function rollCharacterCheck(campaignId: string, characterId: string, _: CheckRollState, fd: FormData): Promise<CheckRollState> {
  const m = await member(campaignId);
  if (!m) return { error: "Du bist kein Mitglied dieser Kampagne." };
  const c = await managedCharacter(campaignId, characterId, { userId: m.user.id, role: m.role });
  if (!c) return { error: "Mit diesem Charakter kannst du nicht würfeln." };

  const sceneId = str(fd, "sceneId");
  if (!isUuid(sceneId)) return { error: "Wähle eine Szene, in die der Wurf gepostet wird." };
  await requireScene(campaignId, sceneId, { userId: m.user.id, role: m.role });

  const check = computeSheet(c.build, c.level).checks[str(fd, "check")];
  if (!check) return { error: "Diesen Wurf gibt es auf dem Bogen nicht." };
  const modeRaw = str(fd, "mode");
  const mode = modeRaw === "advantage" || modeRaw === "disadvantage" ? modeRaw : "normal";
  const roll = rollDice(withAdvantage(check.dice, mode));
  const label = `${check.label}${mode === "advantage" ? " (Vorteil)" : mode === "disadvantage" ? " (Nachteil)" : ""}`;
  // Die Spielleitung kann für fremde Charaktere verdeckt würfeln
  const hidden = isGm(m.role) && fd.get("hidden") === "on";

  await getDb()
    .insert(schema.posts)
    .values({ sceneId, authorId: m.user.id, characterId: c.id, body: str(fd, "note").slice(0, 500), roll, rollLabel: label, rollHidden: hidden });

  revalidatePath(`/kampagnen/${campaignId}/szenen/${sceneId}`);
  return { sentAt: Date.now(), total: roll.total, label };
}

// ---------- Kampagnen-Einstellung: erlaubte Attributsmethoden ----------

export async function setAbilityMethods(campaignId: string, fd: FormData) {
  const m = await member(campaignId);
  if (!m || !isGm(m.role)) return;
  const chosen = ABILITY_METHODS.map((x) => x.id).filter((id) => fd.get(id) === "on");
  if (chosen.length === 0) redirect(`/kampagnen/${campaignId}?einstellung=leer`);
  await getDb().update(schema.campaigns).set({ abilityMethods: chosen }).where(eq(schema.campaigns.id, campaignId));
  revalidatePath(`/kampagnen/${campaignId}`);
}
