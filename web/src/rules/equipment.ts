import type { AbilityId } from "./types";

// Waffen und Rüstungen nach SRD 5.2 (Entfernungen in Metern: 1,5 m je 5 Fuß)

export type WeaponProperty = "finesse" | "light" | "heavy" | "twoHanded" | "reach" | "thrown" | "ammunition" | "loading" | "versatile";

export type MasteryId = "cleave" | "graze" | "nick" | "push" | "sap" | "slow" | "topple" | "vex";

export const MASTERIES: Record<MasteryId, { name: string; summary: string }> = {
  cleave: { name: "Spalten", summary: "Bei einem Nahkampftreffer darfst du einmal pro Zug eine zweite Kreatur in Reichweite angreifen; ohne Attributsmodifikator auf den Schaden." },
  graze: { name: "Streifen", summary: "Verfehlst du, nimmt das Ziel trotzdem Schaden in Höhe deines Attributsmodifikators." },
  nick: { name: "Nachsetzen", summary: "Den Zusatzangriff mit einer leichten Waffe machst du als Teil der Angriffsaktion statt als Bonusaktion." },
  push: { name: "Stoßen", summary: "Bei einem Treffer stößt du ein großes oder kleineres Ziel bis zu 3 m von dir weg." },
  sap: { name: "Schwächen", summary: "Bei einem Treffer hat das Ziel bei seinem nächsten Angriffswurf Nachteil." },
  slow: { name: "Verlangsamen", summary: "Bei einem Treffer mit Schaden sinkt die Bewegungsrate des Ziels bis zu deinem nächsten Zug um 3 m." },
  topple: { name: "Umstoßen", summary: "Bei einem Treffer muss das Ziel einen KO-Rettungswurf schaffen (SG 8 + Attributsmod. + Übungsbonus), sonst liegt es am Boden." },
  vex: { name: "Zermürben", summary: "Bei einem Treffer mit Schaden hast du bei deinem nächsten Angriff gegen dieses Ziel Vorteil." },
};

export const PROPERTY_NAME: Record<WeaponProperty, string> = {
  finesse: "Finesse",
  light: "Leicht",
  heavy: "Schwer",
  twoHanded: "Zweihändig",
  reach: "Reichweite",
  thrown: "Wurfwaffe",
  ammunition: "Geschosse",
  loading: "Laden",
  versatile: "Vielseitig",
};

export type Weapon = {
  id: string;
  name: string;
  category: "simple" | "martial";
  ranged: boolean;
  damage: string; // z. B. "1W8"
  damageType: "Hieb" | "Stich" | "Wucht";
  properties: WeaponProperty[];
  versatile?: string; // Schaden zweihändig
  range?: string; // z. B. "6/18 m"
  mastery: MasteryId;
};

const w = (
  id: string,
  name: string,
  category: Weapon["category"],
  ranged: boolean,
  damage: string,
  damageType: Weapon["damageType"],
  properties: WeaponProperty[],
  mastery: MasteryId,
  extra: Partial<Pick<Weapon, "versatile" | "range">> = {},
): Weapon => ({ id, name, category, ranged, damage, damageType, properties, mastery, ...extra });

export const WEAPONS: Weapon[] = [
  // Einfache Nahkampfwaffen
  w("club", "Knüppel", "simple", false, "1W4", "Wucht", ["light"], "slow"),
  w("dagger", "Dolch", "simple", false, "1W4", "Stich", ["finesse", "light", "thrown"], "nick", { range: "6/18 m" }),
  w("greatclub", "Zweihandknüppel", "simple", false, "1W8", "Wucht", ["twoHanded"], "push"),
  w("handaxe", "Handbeil", "simple", false, "1W6", "Hieb", ["light", "thrown"], "vex", { range: "6/18 m" }),
  w("javelin", "Wurfspeer", "simple", false, "1W6", "Stich", ["thrown"], "slow", { range: "9/36 m" }),
  w("light-hammer", "Leichter Hammer", "simple", false, "1W4", "Wucht", ["light", "thrown"], "nick", { range: "6/18 m" }),
  w("mace", "Streitkolben", "simple", false, "1W6", "Wucht", [], "sap"),
  w("quarterstaff", "Kampfstab", "simple", false, "1W6", "Wucht", ["versatile"], "topple", { versatile: "1W8" }),
  w("sickle", "Sichel", "simple", false, "1W4", "Hieb", ["light"], "nick"),
  w("spear", "Speer", "simple", false, "1W6", "Stich", ["thrown", "versatile"], "sap", { versatile: "1W8", range: "6/18 m" }),
  // Einfache Fernkampfwaffen
  w("dart", "Wurfpfeil", "simple", true, "1W4", "Stich", ["finesse", "thrown"], "vex", { range: "6/18 m" }),
  w("light-crossbow", "Leichte Armbrust", "simple", true, "1W8", "Stich", ["ammunition", "loading", "twoHanded"], "slow", { range: "24/96 m" }),
  w("shortbow", "Kurzbogen", "simple", true, "1W6", "Stich", ["ammunition", "twoHanded"], "vex", { range: "24/96 m" }),
  w("sling", "Schleuder", "simple", true, "1W4", "Wucht", ["ammunition"], "slow", { range: "9/36 m" }),
  // Kriegsnahkampfwaffen
  w("battleaxe", "Streitaxt", "martial", false, "1W8", "Hieb", ["versatile"], "topple", { versatile: "1W10" }),
  w("flail", "Flegel", "martial", false, "1W8", "Wucht", [], "sap"),
  w("glaive", "Glefe", "martial", false, "1W10", "Hieb", ["heavy", "reach", "twoHanded"], "graze"),
  w("greataxe", "Zweihandaxt", "martial", false, "1W12", "Hieb", ["heavy", "twoHanded"], "cleave"),
  w("greatsword", "Zweihandschwert", "martial", false, "2W6", "Hieb", ["heavy", "twoHanded"], "graze"),
  w("halberd", "Hellebarde", "martial", false, "1W10", "Hieb", ["heavy", "reach", "twoHanded"], "cleave"),
  w("lance", "Lanze", "martial", false, "1W10", "Stich", ["heavy", "reach", "twoHanded"], "topple"),
  w("longsword", "Langschwert", "martial", false, "1W8", "Hieb", ["versatile"], "sap", { versatile: "1W10" }),
  w("maul", "Zweihandhammer", "martial", false, "2W6", "Wucht", ["heavy", "twoHanded"], "topple"),
  w("morningstar", "Morgenstern", "martial", false, "1W8", "Stich", [], "sap"),
  w("pike", "Pike", "martial", false, "1W10", "Stich", ["heavy", "reach", "twoHanded"], "push"),
  w("rapier", "Rapier", "martial", false, "1W8", "Stich", ["finesse"], "vex"),
  w("scimitar", "Krummsäbel", "martial", false, "1W6", "Hieb", ["finesse", "light"], "nick"),
  w("shortsword", "Kurzschwert", "martial", false, "1W6", "Stich", ["finesse", "light"], "vex"),
  w("trident", "Dreizack", "martial", false, "1W8", "Stich", ["thrown", "versatile"], "topple", { versatile: "1W10", range: "6/18 m" }),
  w("warhammer", "Kriegshammer", "martial", false, "1W8", "Wucht", ["versatile"], "push", { versatile: "1W10" }),
  w("war-pick", "Kriegspicke", "martial", false, "1W8", "Stich", ["versatile"], "sap", { versatile: "1W10" }),
  w("whip", "Peitsche", "martial", false, "1W4", "Hieb", ["finesse", "reach"], "slow"),
  // Kriegsfernkampfwaffen
  w("hand-crossbow", "Handarmbrust", "martial", true, "1W6", "Stich", ["ammunition", "light", "loading"], "vex", { range: "9/36 m" }),
  w("heavy-crossbow", "Schwere Armbrust", "martial", true, "1W10", "Stich", ["ammunition", "heavy", "loading", "twoHanded"], "push", { range: "30/120 m" }),
  w("longbow", "Langbogen", "martial", true, "1W8", "Stich", ["ammunition", "heavy", "twoHanded"], "slow", { range: "45/180 m" }),
];
export const WEAPON_BY_ID: Record<string, Weapon> = Object.fromEntries(WEAPONS.map((x) => [x.id, x]));

// Welches Attribut eine Waffe für Angriff und Schaden nutzt
export function weaponAbility(weapon: Weapon, scores: Record<AbilityId, number>): AbilityId {
  if (weapon.properties.includes("finesse")) return scores.dex > scores.str ? "dex" : "str";
  return weapon.ranged ? "dex" : "str";
}

export type Armor = {
  id: string;
  name: string;
  category: "light" | "medium" | "heavy" | "shield";
  baseAc: number;
  maxDex?: number; // undefined = voller GE-Modifikator; 0 = keiner
  strength?: number; // Mindeststärke
  stealthDisadvantage?: boolean;
};

export const ARMORS: Armor[] = [
  { id: "padded", name: "Gepolsterte Rüstung", category: "light", baseAc: 11, stealthDisadvantage: true },
  { id: "leather", name: "Lederrüstung", category: "light", baseAc: 11 },
  { id: "studded-leather", name: "Beschlagene Lederrüstung", category: "light", baseAc: 12 },
  { id: "hide", name: "Fellrüstung", category: "medium", baseAc: 12, maxDex: 2 },
  { id: "chain-shirt", name: "Kettenhemd", category: "medium", baseAc: 13, maxDex: 2 },
  { id: "scale-mail", name: "Schuppenpanzer", category: "medium", baseAc: 14, maxDex: 2, stealthDisadvantage: true },
  { id: "breastplate", name: "Brustplatte", category: "medium", baseAc: 14, maxDex: 2 },
  { id: "half-plate", name: "Halbplatte", category: "medium", baseAc: 15, maxDex: 2, stealthDisadvantage: true },
  { id: "ring-mail", name: "Ringpanzer", category: "heavy", baseAc: 14, maxDex: 0, stealthDisadvantage: true },
  { id: "chain-mail", name: "Kettenpanzer", category: "heavy", baseAc: 16, maxDex: 0, strength: 13, stealthDisadvantage: true },
  { id: "splint", name: "Schienenpanzer", category: "heavy", baseAc: 17, maxDex: 0, strength: 15, stealthDisadvantage: true },
  { id: "plate", name: "Plattenpanzer", category: "heavy", baseAc: 18, maxDex: 0, strength: 15, stealthDisadvantage: true },
  { id: "shield", name: "Schild", category: "shield", baseAc: 2 },
];
export const ARMOR_BY_ID: Record<string, Armor> = Object.fromEntries(ARMORS.map((x) => [x.id, x]));

export const ARMOR_CATEGORY_NAME = { light: "leichte Rüstung", medium: "mittelschwere Rüstung", heavy: "schwere Rüstung", shield: "Schilde" } as const;

// Ein Gegenstand im Gepäck. Waffen und Rüstungen verweisen auf die Tabellen oben.
export type Item = { name: string; qty?: number; weapon?: string; armor?: string };

export const item = {
  weapon: (id: string, qty = 1): Item => ({ name: WEAPON_BY_ID[id].name, qty, weapon: id }),
  armor: (id: string): Item => ({ name: ARMOR_BY_ID[id].name, armor: id }),
  gear: (name: string, qty = 1): Item => ({ name, qty }),
};

export type EquipmentOption = { id: string; label: string; items: Item[]; gold: number };
