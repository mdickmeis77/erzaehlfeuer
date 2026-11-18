import { item, type EquipmentOption } from "./equipment";
import type { AbilityId, ClassId, SkillId, SpellList } from "./types";

// Klassen nach SRD 5.2 – im MVP Kämpfer, Schurke, Kleriker, Magier (hier nur Stufe 1)

export type ClassFeature = { name: string; summary: string };

export type CharacterClass = {
  id: ClassId;
  name: string;
  summary: string;
  primary: AbilityId[];
  hitDie: number;
  saves: [AbilityId, AbilityId];
  skillChoice: { count: number; from: SkillId[] };
  armor: ("light" | "medium" | "heavy" | "shield")[];
  weapons: "simple" | "simpleMartial" | "rogue"; // rogue = einfache + Kriegswaffen mit Finesse oder Leicht
  tools: string[];
  weaponMasteries: number;
  features: ClassFeature[];
  spellcasting?: { ability: AbilityId; list: SpellList; cantrips: number; prepared: number; slots: number; spellbook?: number };
  equipment: EquipmentOption[];
};

export const CLASSES: CharacterClass[] = [
  {
    id: "fighter",
    name: "Kämpfer",
    summary: "Meister aller Waffen und Rüstungen. Robust, vielseitig und im Kampf verlässlich.",
    primary: ["str", "dex"],
    hitDie: 10,
    saves: ["str", "con"],
    skillChoice: {
      count: 2,
      from: ["acrobatics", "animalHandling", "athletics", "history", "insight", "intimidation", "persuasion", "perception", "survival"],
    },
    armor: ["light", "medium", "heavy", "shield"],
    weapons: "simpleMartial",
    tools: [],
    weaponMasteries: 3,
    features: [
      { name: "Kampfstil", summary: "Du erhältst ein Kampfstil-Talent deiner Wahl." },
      { name: "Durchatmen", summary: "Als Bonusaktion erhältst du 1W10 + Kämpferstufe Trefferpunkte zurück. Zwei Anwendungen; nach einer kurzen Rast erhältst du eine zurück, nach einer langen Rast alle." },
      { name: "Waffenmeisterschaft", summary: "Du nutzt die Meisterschaftseigenschaft von drei Waffenarten deiner Wahl. Nach einer langen Rast kannst du eine davon austauschen." },
    ],
    equipment: [
      {
        id: "a",
        label: "Schwer gerüstet",
        gold: 4,
        items: [item.armor("chain-mail"), item.weapon("greatsword"), item.weapon("flail"), item.weapon("javelin", 8), item.gear("Gewölbeforscher-Ausrüstung")],
      },
      {
        id: "b",
        label: "Leicht und mit Bogen",
        gold: 11,
        items: [
          item.armor("studded-leather"),
          item.weapon("scimitar"),
          item.weapon("shortsword"),
          item.weapon("longbow"),
          item.gear("Pfeile", 20),
          item.gear("Köcher"),
          item.gear("Gewölbeforscher-Ausrüstung"),
        ],
      },
      { id: "c", label: "155 GM statt Ausrüstung", items: [], gold: 155 },
    ],
  },
  {
    id: "rogue",
    name: "Schurke",
    summary: "Geschickt, heimlich und gefährlich, wenn der Gegner abgelenkt ist. Experte in vielen Fertigkeiten.",
    primary: ["dex"],
    hitDie: 8,
    saves: ["dex", "int"],
    skillChoice: {
      count: 4,
      from: ["acrobatics", "athletics", "deception", "insight", "intimidation", "investigation", "perception", "persuasion", "sleightOfHand", "stealth"],
    },
    armor: ["light"],
    weapons: "rogue",
    tools: ["Diebeswerkzeug"],
    weaponMasteries: 2,
    features: [
      { name: "Expertise", summary: "In zwei deiner geübten Fertigkeiten verdoppelt sich dein Übungsbonus." },
      { name: "Hinterhältiger Angriff", summary: "Einmal pro Zug verursachst du 1W6 zusätzlichen Schaden, wenn du mit einer Finesse- oder Fernkampfwaffe triffst und Vorteil hast oder ein Verbündeter neben dem Ziel steht." },
      { name: "Diebessprache", summary: "Du kennst die Diebessprache und eine weitere Sprache deiner Wahl." },
      { name: "Waffenmeisterschaft", summary: "Du nutzt die Meisterschaftseigenschaft von zwei Waffenarten deiner Wahl. Nach einer langen Rast kannst du sie austauschen." },
    ],
    equipment: [
      {
        id: "a",
        label: "Ausrüstungspaket",
        gold: 8,
        items: [
          item.armor("leather"),
          item.weapon("dagger", 2),
          item.weapon("shortsword"),
          item.weapon("shortbow"),
          item.gear("Pfeile", 20),
          item.gear("Köcher"),
          item.gear("Diebeswerkzeug"),
          item.gear("Einbrecher-Ausrüstung"),
        ],
      },
      { id: "b", label: "100 GM statt Ausrüstung", items: [], gold: 100 },
    ],
  },
  {
    id: "cleric",
    name: "Kleriker",
    summary: "Diener einer Gottheit, der heilt, schützt und göttliche Macht entfesselt.",
    primary: ["wis"],
    hitDie: 8,
    saves: ["wis", "cha"],
    skillChoice: { count: 2, from: ["history", "insight", "medicine", "persuasion", "religion"] },
    armor: ["light", "medium", "shield"],
    weapons: "simple",
    tools: [],
    weaponMasteries: 0,
    features: [
      { name: "Zauberwirken", summary: "Du wirkst Klerikerzauber mit Weisheit. Nach einer langen Rast kannst du deine vorbereiteten Zauber neu wählen." },
      { name: "Göttliche Ordnung", summary: "Du wählst eine heilige Rolle: Beschützer oder Thaumaturg." },
    ],
    spellcasting: { ability: "wis", list: "cleric", cantrips: 3, prepared: 4, slots: 2 },
    equipment: [
      {
        id: "a",
        label: "Ausrüstungspaket",
        gold: 7,
        items: [item.armor("chain-shirt"), item.armor("shield"), item.weapon("mace"), item.gear("Heiliges Symbol"), item.gear("Priester-Ausrüstung")],
      },
      { id: "b", label: "110 GM statt Ausrüstung", items: [], gold: 110 },
    ],
  },
  {
    id: "wizard",
    name: "Magier",
    summary: "Gelehrter der arkanen Künste mit einem Zauberbuch voller Möglichkeiten.",
    primary: ["int"],
    hitDie: 6,
    saves: ["int", "wis"],
    skillChoice: { count: 2, from: ["arcana", "history", "insight", "investigation", "medicine", "nature", "religion"] },
    armor: [],
    weapons: "simple",
    tools: [],
    weaponMasteries: 0,
    features: [
      { name: "Zauberwirken", summary: "Du wirkst Magierzauber mit Intelligenz aus deinem Zauberbuch. Nach einer langen Rast kannst du deine vorbereiteten Zauber neu wählen." },
      { name: "Ritualkundig", summary: "Rituale aus deinem Zauberbuch kannst du wirken, ohne sie vorbereitet zu haben." },
      { name: "Arkane Erholung", summary: "Einmal pro Tag nach einer kurzen Rast erhältst du verbrauchte Zauberplätze zurück (zusammen bis zur Hälfte deiner Magierstufe, aufgerundet)." },
    ],
    spellcasting: { ability: "int", list: "wizard", cantrips: 3, prepared: 4, slots: 2, spellbook: 6 },
    equipment: [
      {
        id: "a",
        label: "Ausrüstungspaket",
        gold: 5,
        items: [item.weapon("dagger", 2), item.weapon("quarterstaff"), item.gear("Robe"), item.gear("Zauberbuch"), item.gear("Gelehrten-Ausrüstung")],
      },
      { id: "b", label: "55 GM statt Ausrüstung", items: [], gold: 55 },
    ],
  },
];
export const CLASS_BY_ID: Record<string, CharacterClass> = Object.fromEntries(CLASSES.map((c) => [c.id, c]));

export const DIVINE_ORDERS = [
  { id: "protector", name: "Beschützer", summary: "Du bist im Umgang mit Kriegswaffen und schweren Rüstungen geübt." },
  { id: "thaumaturge", name: "Thaumaturg", summary: "Ein zusätzlicher Zaubertrick, und bei Arkane Kunde und Religion addierst du deinen WE-Modifikator (mindestens +1)." },
] as const;
export type DivineOrder = (typeof DIVINE_ORDERS)[number]["id"];
