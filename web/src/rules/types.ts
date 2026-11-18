// Datentypen für die Regeldaten (SRD 5.2, ins Deutsche übertragen).
// Die Regeldaten sind reine Daten ohne Logik; berechnet wird in src/rules/sheet.ts.

export type AbilityId = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type SkillId =
  | "acrobatics"
  | "animalHandling"
  | "arcana"
  | "athletics"
  | "deception"
  | "history"
  | "insight"
  | "intimidation"
  | "investigation"
  | "medicine"
  | "nature"
  | "perception"
  | "performance"
  | "persuasion"
  | "religion"
  | "sleightOfHand"
  | "stealth"
  | "survival";

export type ClassId = "fighter" | "rogue" | "cleric" | "wizard";

export type SpellList = "cleric" | "wizard";

export type Spell = {
  id: string; // englischer Schlüssel in kebab-case, z. B. "magic-missile"
  name: string; // deutscher Name
  level: 0 | 1; // 0 = Zaubertrick
  lists: SpellList[];
  school: string; // deutsch, z. B. "Hervorrufung"
  castingTime: string; // z. B. "1 Aktion", "1 Bonusaktion", "1 Reaktion"
  range: string; // in Metern, z. B. "36 m", "Berührung", "Selbst"
  duration: string; // z. B. "Unmittelbar", "Konzentration, bis zu 1 Minute"
  ritual?: boolean;
  concentration?: boolean;
  summary: string; // 1–2 Sätze in eigenen Worten
  attack?: boolean; // Zauberangriff (W20 + Zauberangriffsbonus)
  save?: AbilityId; // Rettungswurf des Ziels gegen den Zauber-SG
  damage?: string; // Würfelausdruck auf Stufe 1, z. B. "1W10" oder "3W4+3"
  damageType?: string; // deutsch, z. B. "Feuer"
  healing?: string; // Würfelausdruck, "+MOD" wird durch den Zaubermodifikator ersetzt, z. B. "2W8+MOD"
};
