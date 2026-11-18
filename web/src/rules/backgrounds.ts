import { item, type EquipmentOption } from "./equipment";
import type { AbilityId, SkillId, SpellList } from "./types";

// Hintergründe nach SRD 5.2

export type Background = {
  id: string;
  name: string;
  summary: string;
  abilities: [AbilityId, AbilityId, AbilityId]; // erhalten +2/+1 oder +1/+1/+1
  feat: string;
  featSpellList?: SpellList; // bei Magie-Eingeweihter
  skills: [SkillId, SkillId];
  tool: string; // "gaming-set" = Spielset nach Wahl
  equipment: EquipmentOption[];
};

const gold50 = (id = "b"): EquipmentOption => ({ id, label: "50 GM statt Ausrüstung", items: [], gold: 50 });

export const BACKGROUNDS: Background[] = [
  {
    id: "acolyte",
    name: "Tempeldiener",
    summary: "Du hast im Dienst eines Tempels gelebt und die Riten deines Glaubens gelernt.",
    abilities: ["int", "wis", "cha"],
    feat: "magic-initiate",
    featSpellList: "cleric",
    skills: ["insight", "religion"],
    tool: "Kalligrafie-Werkzeug",
    equipment: [
      {
        id: "a",
        label: "Ausrüstungspaket",
        gold: 8,
        items: [
          item.gear("Kalligrafie-Werkzeug"),
          item.gear("Buch (Gebete)"),
          item.gear("Heiliges Symbol"),
          item.gear("Pergament", 10),
          item.gear("Robe"),
        ],
      },
      gold50(),
    ],
  },
  {
    id: "criminal",
    name: "Krimineller",
    summary: "Du hast dir deinen Lebensunterhalt in dunklen Gassen verdient, mit Taschendiebstahl, Schmuggel oder Einbrüchen.",
    abilities: ["dex", "con", "int"],
    feat: "alert",
    skills: ["sleightOfHand", "stealth"],
    tool: "Diebeswerkzeug",
    equipment: [
      {
        id: "a",
        label: "Ausrüstungspaket",
        gold: 16,
        items: [
          item.weapon("dagger", 2),
          item.gear("Diebeswerkzeug"),
          item.gear("Brecheisen"),
          item.gear("Beutel", 2),
          item.gear("Reisekleidung"),
        ],
      },
      gold50(),
    ],
  },
  {
    id: "sage",
    name: "Weiser",
    summary: "Du hast Jahre in Bibliotheken und Studierstuben verbracht und dir Wissen über die Welt und die Magie angeeignet.",
    abilities: ["con", "int", "wis"],
    feat: "magic-initiate",
    featSpellList: "wizard",
    skills: ["arcana", "history"],
    tool: "Kalligrafie-Werkzeug",
    equipment: [
      {
        id: "a",
        label: "Ausrüstungspaket",
        gold: 8,
        items: [
          item.weapon("quarterstaff"),
          item.gear("Kalligrafie-Werkzeug"),
          item.gear("Buch (Geschichte)"),
          item.gear("Pergament", 8),
          item.gear("Robe"),
        ],
      },
      gold50(),
    ],
  },
  {
    id: "soldier",
    name: "Soldat",
    summary: "Du hast in einer Armee gedient und gelernt, zu kämpfen und Befehle zu befolgen.",
    abilities: ["str", "dex", "con"],
    feat: "savage-attacker",
    skills: ["athletics", "intimidation"],
    tool: "gaming-set",
    equipment: [
      {
        id: "a",
        label: "Ausrüstungspaket",
        gold: 14,
        items: [
          item.weapon("spear"),
          item.weapon("shortbow"),
          item.gear("Pfeile", 20),
          item.gear("Spielset"),
          item.gear("Heilerausrüstung"),
          item.gear("Köcher"),
          item.gear("Reisekleidung"),
        ],
      },
      gold50(),
    ],
  },
];
export const BACKGROUND_BY_ID: Record<string, Background> = Object.fromEntries(BACKGROUNDS.map((b) => [b.id, b]));
