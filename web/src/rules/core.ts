import type { AbilityId, SkillId } from "./types";

// Grundbegriffe nach SRD 5.2, ins Deutsche übertragen

export const ABILITIES: { id: AbilityId; name: string; short: string }[] = [
  { id: "str", name: "Stärke", short: "ST" },
  { id: "dex", name: "Geschicklichkeit", short: "GE" },
  { id: "con", name: "Konstitution", short: "KO" },
  { id: "int", name: "Intelligenz", short: "IN" },
  { id: "wis", name: "Weisheit", short: "WE" },
  { id: "cha", name: "Charisma", short: "CH" },
];
export const ABILITY_IDS = ABILITIES.map((a) => a.id);
export const ABILITY_NAME = Object.fromEntries(ABILITIES.map((a) => [a.id, a.name])) as Record<AbilityId, string>;
export const ABILITY_SHORT = Object.fromEntries(ABILITIES.map((a) => [a.id, a.short])) as Record<AbilityId, string>;

export const SKILLS: { id: SkillId; name: string; ability: AbilityId }[] = [
  { id: "acrobatics", name: "Akrobatik", ability: "dex" },
  { id: "arcana", name: "Arkane Kunde", ability: "int" },
  { id: "athletics", name: "Athletik", ability: "str" },
  { id: "performance", name: "Auftreten", ability: "cha" },
  { id: "persuasion", name: "Überzeugen", ability: "cha" },
  { id: "intimidation", name: "Einschüchtern", ability: "cha" },
  { id: "sleightOfHand", name: "Fingerfertigkeit", ability: "dex" },
  { id: "history", name: "Geschichte", ability: "int" },
  { id: "medicine", name: "Heilkunde", ability: "wis" },
  { id: "stealth", name: "Heimlichkeit", ability: "dex" },
  { id: "animalHandling", name: "Mit Tieren umgehen", ability: "wis" },
  { id: "insight", name: "Motiv erkennen", ability: "wis" },
  { id: "investigation", name: "Nachforschungen", ability: "int" },
  { id: "nature", name: "Naturkunde", ability: "int" },
  { id: "religion", name: "Religion", ability: "int" },
  { id: "deception", name: "Täuschen", ability: "cha" },
  { id: "survival", name: "Überlebenskunst", ability: "wis" },
  { id: "perception", name: "Wahrnehmung", ability: "wis" },
].sort((a, b) => a.name.localeCompare(b.name, "de")) as { id: SkillId; name: string; ability: AbilityId }[];
export const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s])) as Record<SkillId, (typeof SKILLS)[number]>;
export const SKILL_IDS = SKILLS.map((s) => s.id);

// Standardsprachen (die Gemeinsprache kann jeder Charakter)
export const LANGUAGES = [
  { id: "common-sign", name: "Gemeinsprache der Zeichen" },
  { id: "draconic", name: "Drakonisch" },
  { id: "dwarvish", name: "Zwergisch" },
  { id: "elvish", name: "Elfisch" },
  { id: "giant", name: "Riesisch" },
  { id: "gnomish", name: "Gnomisch" },
  { id: "goblin", name: "Goblinisch" },
  { id: "halfling", name: "Halblingisch" },
  { id: "orc", name: "Orkisch" },
];
export const LANGUAGE_NAME: Record<string, string> = Object.fromEntries(LANGUAGES.map((l) => [l.id, l.name]));

export const abilityMod = (score: number) => Math.floor((score - 10) / 2);
export const proficiencyBonus = (level: number) => 2 + Math.floor((level - 1) / 4);
export const signed = (n: number) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);

// Attributswerte bestimmen
export type AbilityMethod = "standard" | "pointbuy" | "roll";
export const ABILITY_METHODS: { id: AbilityMethod; name: string; description: string }[] = [
  { id: "standard", name: "Standardwerte", description: "Verteile 15, 14, 13, 12, 10 und 8 auf die sechs Attribute." },
  { id: "pointbuy", name: "Punktekauf", description: "Kaufe Werte zwischen 8 und 15 mit 27 Punkten." },
  { id: "roll", name: "Würfeln", description: "Würfle sechsmal 4W6, der niedrigste Würfel zählt nicht. Verteile die Ergebnisse." },
];
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_COST: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
export const MAX_ABILITY_SCORE = 20;

export function pointBuyTotal(scores: number[]): number | null {
  let total = 0;
  for (const s of scores) {
    const cost = POINT_BUY_COST[s];
    if (cost === undefined) return null;
    total += cost;
  }
  return total;
}

// Spieltische
export const GAMING_SETS = [
  { id: "dice", name: "Würfelspiel" },
  { id: "dragonchess", name: "Drachenschach" },
  { id: "cards", name: "Spielkarten" },
  { id: "three-dragon", name: "Drei-Drachen-Ante" },
];
