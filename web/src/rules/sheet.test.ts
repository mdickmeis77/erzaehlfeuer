import { describe, expect, it } from "vitest";
import { rollDice, withAdvantage } from "@/lib/dice";
import { emptyBuild, validateBuild, type CharacterBuild } from "./build";
import { computeSheet } from "./sheet";

// Halbling-Schurkin mit Hintergrund Kriminelle, Standardwerte
function rogue(): CharacterBuild {
  return {
    ...emptyBuild("standard"),
    species: "halfling",
    class: "rogue",
    classSkills: ["acrobatics", "perception", "deception", "investigation"],
    expertise: ["stealth", "perception"],
    weaponMasteries: ["dagger", "shortsword"],
    background: "criminal",
    backgroundFeat: { id: "alert" },
    languages: ["halfling", "elvish", "goblin"],
    baseScores: { str: 8, dex: 15, con: 14, int: 12, wis: 13, cha: 10 },
    backgroundBonus: { dex: 2, con: 1 },
    classEquipment: "a",
    backgroundEquipment: "a",
  };
}

// Zwergen-Klerikerin (Beschützerin) mit Hintergrund Tempeldiener
function cleric(): CharacterBuild {
  return {
    ...emptyBuild("pointbuy"),
    species: "dwarf",
    class: "cleric",
    classSkills: ["medicine", "persuasion"],
    divineOrder: "protector",
    cantrips: ["guidance", "sacred-flame", "light"],
    prepared: ["cure-wounds", "bless", "guiding-bolt", "healing-word"],
    background: "acolyte",
    backgroundFeat: { id: "magic-initiate", cantrips: ["spare-the-dying", "thaumaturgy"], spell: "sanctuary", ability: "wis" },
    languages: ["dwarvish", "giant"],
    baseScores: { str: 14, dex: 8, con: 14, int: 8, wis: 15, cha: 10 },
    backgroundBonus: { wis: 2, cha: 1 },
    classEquipment: "a",
    backgroundEquipment: "b",
  };
}

describe("validateBuild", () => {
  it("akzeptiert vollständige Charaktere", () => {
    expect(validateBuild(rogue())).toEqual([]);
    expect(validateBuild(cleric())).toEqual([]);
  });

  it("meldet doppelte Fertigkeiten aus Klasse und Hintergrund", () => {
    const b = { ...rogue(), classSkills: ["stealth", "perception", "deception", "investigation"] as CharacterBuild["classSkills"] };
    expect(validateBuild(b).some((i) => i.step === 1 && i.message.includes("Heimlichkeit"))).toBe(true);
  });

  it("prüft Punktekauf und Hintergrundboni", () => {
    const b = cleric();
    b.baseScores.str = 15;
    b.baseScores.con = 15; // 25 + 4 = 29 Punkte
    expect(validateBuild(b).some((i) => i.step === 3)).toBe(true);
    const c = cleric();
    c.backgroundBonus = { str: 2, wis: 1 }; // Stärke gehört nicht zum Tempeldiener
    expect(validateBuild(c).some((i) => i.step === 3)).toBe(true);
  });

  it("prüft gewürfelte Werte gegen den Wurf", () => {
    const b = { ...rogue(), abilityMethod: "roll" as const };
    expect(validateBuild(b, { rolledValues: null }).some((i) => i.step === 3)).toBe(true);
    expect(validateBuild(b, { rolledValues: [15, 14, 13, 12, 10, 8] })).toEqual([]);
    expect(validateBuild(b, { rolledValues: [16, 14, 13, 12, 10, 8] }).some((i) => i.step === 3)).toBe(true);
  });

  it("verlangt einen zusätzlichen Zaubertrick für Thaumaturgen", () => {
    const b = { ...cleric(), divineOrder: "thaumaturge" as const };
    expect(validateBuild(b).some((i) => i.message.includes("4 Zaubertricks"))).toBe(true);
  });
});

describe("computeSheet", () => {
  it("berechnet die Schurkin korrekt", () => {
    const s = computeSheet(rogue());
    expect(s.scores.dex).toBe(17);
    expect(s.mods.dex).toBe(3);
    expect(s.hpMax).toBe(8 + 2); // W8 + KO 15 (+2)
    expect(s.ac).toBe(11 + 3); // Lederrüstung
    expect(s.initiative).toBe(3 + 2); // Wachsam
    const stealth = s.skills.find((x) => x.id === "stealth")!;
    expect(stealth.bonus).toBe(3 + 4); // Expertise
    expect(s.passivePerception).toBe(10 + 1 + 4);
    const dagger = s.attacks.find((a) => a.key === "weapon-dagger")!;
    expect(dagger.toHit).toBe(5);
    expect(dagger.damage).toBe("1W4+3");
    expect(s.checks["skill:stealth"].dice).toBe("1W20+7");
    expect(s.gold).toBe(8 + 16);
    expect(s.proficiencies.languages).toContain("Diebessprache");
  });

  it("berechnet die Klerikerin korrekt", () => {
    const s = computeSheet(cleric());
    expect(s.hpMax).toBe(8 + 2 + 1); // W8 + KO + Zwergische Zähigkeit
    expect(s.ac).toBe(13 - 1 + 2); // Kettenhemd mit GE −1, plus Schild
    expect(s.saves.find((x) => x.ability === "wis")!.bonus).toBe(3 + 2);
    const main = s.spellGroups[0];
    expect(main.saveDc).toBe(8 + 2 + 3);
    expect(main.attackBonus).toBe(5);
    expect(s.checks[main.spells.find((x) => x.id === "cure-wounds")!.checks.healing!].dice).toBe("2W8+3");
    expect(s.spellGroups.some((g) => g.source.startsWith("Magie-Eingeweihter"))).toBe(true);
    expect(s.resistances).toContain("Gift");
  });
});

describe("Würfel mit Vorteil", () => {
  it("behält den höheren Würfel", () => {
    const values = [4, 17];
    const r = rollDice(withAdvantage("1W20+5", "advantage"), () => values.shift()!);
    expect(r.total).toBe(22);
    expect(r.expression).toBe("2W20h1+5");
  });
  it("behält bei Nachteil den niedrigeren Würfel", () => {
    const values = [4, 17];
    expect(rollDice(withAdvantage("1W20+5", "disadvantage"), () => values.shift()!).total).toBe(9);
  });
});
