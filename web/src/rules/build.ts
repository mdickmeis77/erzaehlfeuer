import { BACKGROUND_BY_ID } from "./backgrounds";
import { CLASS_BY_ID, DIVINE_ORDERS, type DivineOrder } from "./classes";
import {
  ABILITY_IDS,
  ABILITY_NAME,
  LANGUAGES,
  GAMING_SETS,
  MAX_ABILITY_SCORE,
  POINT_BUY_BUDGET,
  SKILL_BY_ID,
  SKILL_IDS,
  STANDARD_ARRAY,
  pointBuyTotal,
  type AbilityMethod,
} from "./core";
import { WEAPONS, WEAPON_BY_ID, type Weapon } from "./equipment";
import { FEAT_BY_ID, FIGHTING_STYLES, SKILLED_COUNT } from "./feats";
import { SPECIES_BY_ID } from "./species";
import { SPELL_BY_ID } from "./spells";
import type { AbilityId, ClassId, SkillId, SpellList } from "./types";

// Alle Entscheidungen eines Charakters auf Stufe 1. Gespeichert wird nur diese Auswahl;
// alle Werte des Charakterbogens werden daraus berechnet (src/rules/sheet.ts).

export type CasterAbility = "int" | "wis" | "cha";

export type FeatChoice = {
  id: string;
  list?: SpellList; // Magie-Eingeweihter
  cantrips?: string[];
  spell?: string;
  ability?: CasterAbility;
  skills?: SkillId[]; // Vielseitig begabt
};

export type CharacterBuild = {
  species: string;
  speciesOption?: string;
  size?: "medium" | "small";
  speciesSkills: SkillId[];
  speciesSpellAbility?: CasterAbility;
  speciesFeat?: FeatChoice; // Mensch: Vielseitig

  class: ClassId | "";
  classSkills: SkillId[];
  fightingStyle?: string;
  divineOrder?: DivineOrder;
  expertise: SkillId[];
  weaponMasteries: string[];
  cantrips: string[];
  spellbook: string[]; // nur Magier
  prepared: string[];

  background: string;
  backgroundFeat: FeatChoice;
  gamingSet?: string;
  languages: string[];

  abilityMethod: AbilityMethod;
  baseScores: Record<AbilityId, number>;
  rollId?: string;
  backgroundBonus: Partial<Record<AbilityId, number>>;

  classEquipment: string;
  backgroundEquipment: string;
};

export const STEPS = ["Spezies", "Klasse", "Hintergrund", "Werte", "Ausrüstung", "Abschluss"] as const;

export function emptyBuild(method: AbilityMethod = "standard"): CharacterBuild {
  return {
    species: "",
    speciesSkills: [],
    class: "",
    classSkills: [],
    expertise: [],
    weaponMasteries: [],
    cantrips: [],
    spellbook: [],
    prepared: [],
    background: "",
    backgroundFeat: { id: "" },
    languages: [],
    abilityMethod: method,
    baseScores: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
    backgroundBonus: {},
    classEquipment: "",
    backgroundEquipment: "",
  };
}

export type BuildIssue = { step: number; message: string };

const isCaster = (a: unknown): a is CasterAbility => a === "int" || a === "wis" || a === "cha";
const unique = <T>(xs: T[]) => new Set(xs).size === xs.length;

export function canMasterWeapon(classId: ClassId | "", weapon: Weapon) {
  if (classId === "fighter") return true;
  if (classId === "rogue") return weapon.category === "simple" || weapon.properties.includes("finesse") || weapon.properties.includes("light");
  return false;
}

// Fertigkeiten, die schon aus anderen Quellen kommen (in Auswahlreihenfolge)
export function skillSources(build: CharacterBuild) {
  const bg = BACKGROUND_BY_ID[build.background];
  return {
    background: bg ? [...bg.skills] : [],
    class: build.classSkills,
    species: build.speciesSkills,
    feat: [...(build.speciesFeat?.skills ?? []), ...(build.backgroundFeat.skills ?? [])],
  };
}

export function proficientSkills(build: CharacterBuild): SkillId[] {
  const s = skillSources(build);
  return [...new Set([...s.background, ...s.class, ...s.species, ...s.feat])];
}

function spellsOf(list: SpellList, level: 0 | 1) {
  return (id: string) => {
    const sp = SPELL_BY_ID[id];
    return Boolean(sp && sp.level === level && sp.lists.includes(list));
  };
}

function checkFeat(choice: FeatChoice | undefined, step: number, label: string, fixedList: SpellList | undefined, issues: BuildIssue[], taken: Set<SkillId>) {
  if (!choice || !FEAT_BY_ID[choice.id] || FEAT_BY_ID[choice.id].category !== "origin") {
    issues.push({ step, message: `${label}: Wähle ein Herkunftstalent.` });
    return;
  }
  if (choice.id === "magic-initiate") {
    const list = fixedList ?? choice.list;
    if (list !== "cleric" && list !== "wizard") {
      issues.push({ step, message: `${label}: Wähle die Zauberliste (Kleriker oder Magier).` });
      return;
    }
    const cantrips = choice.cantrips ?? [];
    if (cantrips.length !== 2 || !unique(cantrips) || !cantrips.every(spellsOf(list, 0))) {
      issues.push({ step, message: `${label}: Wähle genau zwei Zaubertricks.` });
    }
    if (!choice.spell || !spellsOf(list, 1)(choice.spell)) issues.push({ step, message: `${label}: Wähle einen Zauber des 1. Grades.` });
    if (!isCaster(choice.ability)) issues.push({ step, message: `${label}: Wähle das Attribut für diese Zauber.` });
  }
  if (choice.id === "skilled") {
    const skills = choice.skills ?? [];
    if (skills.length !== SKILLED_COUNT || !unique(skills) || !skills.every((s) => SKILL_IDS.includes(s))) {
      issues.push({ step, message: `${label}: Wähle genau ${SKILLED_COUNT} Fertigkeiten.` });
    }
    for (const s of skills) {
      if (taken.has(s)) issues.push({ step, message: `${label}: ${SKILL_BY_ID[s]?.name ?? s} beherrschst du bereits.` });
      taken.add(s);
    }
  }
}

export type ValidateOptions = { allowedMethods?: AbilityMethod[]; rolledValues?: number[] | null };

export function validateBuild(build: CharacterBuild, opts: ValidateOptions = {}): BuildIssue[] {
  const issues: BuildIssue[] = [];
  const species = SPECIES_BY_ID[build.species];
  const cls = build.class ? CLASS_BY_ID[build.class] : undefined;
  const bg = BACKGROUND_BY_ID[build.background];
  const taken = new Set<SkillId>();

  // 1 Spezies
  if (!species) {
    issues.push({ step: 0, message: "Wähle eine Spezies." });
  } else {
    if (species.option && !species.option.options.some((o) => o.id === build.speciesOption)) {
      issues.push({ step: 0, message: `Wähle: ${species.option.label}.` });
    }
    if (species.size === "choice" && build.size !== "medium" && build.size !== "small") issues.push({ step: 0, message: "Wähle die Größe." });
    if (species.spellAbilityChoice && !isCaster(build.speciesSpellAbility)) issues.push({ step: 0, message: "Wähle das Attribut für die Zauber deiner Spezies." });
    if (species.skillChoice) {
      const allowed = species.skillChoice.from === "any" ? SKILL_IDS : species.skillChoice.from;
      if (build.speciesSkills.length !== species.skillChoice.count || !build.speciesSkills.every((s) => allowed.includes(s))) {
        issues.push({ step: 0, message: `${species.skillChoice.label}: Wähle eine Fertigkeit.` });
      }
    } else if (build.speciesSkills.length > 0) {
      issues.push({ step: 0, message: "Diese Spezies gewährt keine Fertigkeit." });
    }
  }

  // 3 Hintergrund (fest vorgegebene Fertigkeiten zuerst, damit Doppelungen bei der Auswahl auffallen)
  if (!bg) {
    issues.push({ step: 2, message: "Wähle einen Hintergrund." });
  } else {
    bg.skills.forEach((s) => taken.add(s));
  }

  // 2 Klasse
  if (!cls) {
    issues.push({ step: 1, message: "Wähle eine Klasse." });
  } else {
    const picks = build.classSkills;
    if (picks.length !== cls.skillChoice.count || !unique(picks) || !picks.every((s) => cls.skillChoice.from.includes(s))) {
      issues.push({ step: 1, message: `Wähle genau ${cls.skillChoice.count} Fertigkeiten deiner Klasse.` });
    }
    for (const s of picks) {
      if (taken.has(s)) issues.push({ step: 1, message: `${SKILL_BY_ID[s]?.name ?? s} hast du schon durch deinen Hintergrund – wähle eine andere Fertigkeit.` });
      taken.add(s);
    }

    if (cls.id === "fighter" && !FIGHTING_STYLES.some((f) => f.id === build.fightingStyle)) issues.push({ step: 1, message: "Wähle einen Kampfstil." });
    if (cls.id === "cleric" && !DIVINE_ORDERS.some((o) => o.id === build.divineOrder)) issues.push({ step: 1, message: "Wähle eine göttliche Ordnung." });

    if (cls.weaponMasteries > 0) {
      const wm = build.weaponMasteries;
      if (wm.length !== cls.weaponMasteries || !unique(wm) || !wm.every((id) => WEAPON_BY_ID[id] && canMasterWeapon(cls.id, WEAPON_BY_ID[id]))) {
        issues.push({ step: 1, message: `Wähle genau ${cls.weaponMasteries} Waffen für die Waffenmeisterschaft.` });
      }
    }

    if (cls.spellcasting) {
      const sc = cls.spellcasting;
      const cantripCount = sc.cantrips + (cls.id === "cleric" && build.divineOrder === "thaumaturge" ? 1 : 0);
      if (build.cantrips.length !== cantripCount || !unique(build.cantrips) || !build.cantrips.every(spellsOf(sc.list, 0))) {
        issues.push({ step: 1, message: `Wähle genau ${cantripCount} Zaubertricks.` });
      }
      if (sc.spellbook) {
        if (build.spellbook.length !== sc.spellbook || !unique(build.spellbook) || !build.spellbook.every(spellsOf(sc.list, 1))) {
          issues.push({ step: 1, message: `Wähle genau ${sc.spellbook} Zauber für dein Zauberbuch.` });
        }
      }
      const pool = sc.spellbook ? (id: string) => build.spellbook.includes(id) : spellsOf(sc.list, 1);
      if (build.prepared.length !== sc.prepared || !unique(build.prepared) || !build.prepared.every(pool)) {
        issues.push({ step: 1, message: `Bereite genau ${sc.prepared} Zauber vor${sc.spellbook ? " (aus deinem Zauberbuch)" : ""}.` });
      }
    }
  }

  // Spezies-Fertigkeit gegen Hintergrund und Klasse prüfen
  for (const s of build.speciesSkills) {
    if (taken.has(s)) issues.push({ step: 0, message: `${SKILL_BY_ID[s]?.name ?? s} beherrschst du schon durch Klasse oder Hintergrund – wähle bei der Spezies eine andere.` });
    taken.add(s);
  }
  if (species?.originFeat) checkFeat(build.speciesFeat, 0, "Vielseitig", undefined, issues, taken);

  if (bg) {
    if (build.backgroundFeat.id !== bg.feat) issues.push({ step: 2, message: "Das Talent passt nicht zum Hintergrund." });
    else checkFeat(build.backgroundFeat, 2, FEAT_BY_ID[bg.feat].name, bg.featSpellList, issues, taken);
    if (bg.tool === "gaming-set" && !GAMING_SETS.some((g) => g.id === build.gamingSet)) issues.push({ step: 2, message: "Wähle ein Spielset." });
  }

  // Sprachen: Gemeinsprache + 2, Schurken eine weitere
  const langCount = 2 + (cls?.id === "rogue" ? 1 : 0);
  if (build.languages.length !== langCount || !unique(build.languages) || !build.languages.every((l) => LANGUAGES.some((x) => x.id === l))) {
    issues.push({ step: 2, message: `Wähle genau ${langCount} Sprachen.` });
  }

  // Expertise (Schurke): zwei geübte Fertigkeiten
  if (cls?.id === "rogue") {
    const prof = proficientSkills(build);
    if (build.expertise.length !== 2 || !unique(build.expertise) || !build.expertise.every((s) => prof.includes(s))) {
      issues.push({ step: 2, message: "Expertise: Wähle zwei Fertigkeiten, in denen du geübt bist." });
    }
  }

  // 4 Werte
  const method = build.abilityMethod;
  if (opts.allowedMethods && !opts.allowedMethods.includes(method)) {
    issues.push({ step: 3, message: "Diese Methode ist in der Kampagne nicht erlaubt." });
  }
  const base = ABILITY_IDS.map((a) => build.baseScores[a]);
  const sameMultiset = (a: number[], b: number[]) => a.length === b.length && [...a].sort().join() === [...b].sort().join();
  if (method === "standard" && !sameMultiset(base, STANDARD_ARRAY)) {
    issues.push({ step: 3, message: "Verteile jeden Standardwert (15, 14, 13, 12, 10, 8) genau einmal." });
  } else if (method === "pointbuy") {
    const total = pointBuyTotal(base);
    if (total === null) issues.push({ step: 3, message: "Beim Punktekauf liegt jeder Wert zwischen 8 und 15." });
    else if (total > POINT_BUY_BUDGET) issues.push({ step: 3, message: `Du hast ${total} von ${POINT_BUY_BUDGET} Punkten ausgegeben.` });
  } else if (method === "roll") {
    if (!opts.rolledValues) issues.push({ step: 3, message: "Würfle zuerst deine Werte." });
    else if (!sameMultiset(base, opts.rolledValues)) issues.push({ step: 3, message: "Verteile jedes gewürfelte Ergebnis genau einmal." });
  }

  if (bg) {
    const entries = Object.entries(build.backgroundBonus).filter(([, v]) => v) as [AbilityId, number][];
    const valid =
      entries.every(([a]) => bg.abilities.includes(a)) &&
      ((entries.length === 2 && entries.map(([, v]) => v).sort().join() === "1,2") ||
        (entries.length === 3 && entries.every(([, v]) => v === 1)));
    if (!valid) {
      issues.push({ step: 3, message: `Verteile die Boni deines Hintergrunds: +2 und +1 oder dreimal +1 auf ${bg.abilities.map((a) => ABILITY_NAME[a]).join(", ")}.` });
    }
    for (const [a, v] of entries) {
      if ((build.baseScores[a] ?? 0) + v > MAX_ABILITY_SCORE) issues.push({ step: 3, message: `${ABILITY_NAME[a]} darf höchstens ${MAX_ABILITY_SCORE} sein.` });
    }
  }

  // 5 Ausrüstung
  if (!cls?.equipment.some((o) => o.id === build.classEquipment)) issues.push({ step: 4, message: "Wähle die Ausrüstung deiner Klasse." });
  if (!bg?.equipment.some((o) => o.id === build.backgroundEquipment)) issues.push({ step: 4, message: "Wähle die Ausrüstung deines Hintergrunds." });

  return issues;
}

export const MASTERABLE_WEAPONS = (classId: ClassId | "") => WEAPONS.filter((w) => canMasterWeapon(classId, w));
