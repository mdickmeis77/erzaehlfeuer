import { BACKGROUND_BY_ID } from "./backgrounds";
import { type CharacterBuild, type CasterAbility, proficientSkills } from "./build";
import { CLASS_BY_ID, DIVINE_ORDERS } from "./classes";
import { ABILITIES, ABILITY_IDS, ABILITY_SHORT, GAMING_SETS, LANGUAGE_NAME, SKILLS, abilityMod, proficiencyBonus, signed } from "./core";
import { ARMOR_BY_ID, ARMOR_CATEGORY_NAME, MASTERIES, WEAPON_BY_ID, weaponAbility, type Item, type Weapon } from "./equipment";
import { FEAT_BY_ID } from "./feats";
import { SIZE_NAME, SPECIES_BY_ID } from "./species";
import { SPELL_BY_ID } from "./spells";
import type { AbilityId, SkillId, Spell } from "./types";

// Berechnet aus der Auswahl (CharacterBuild) alle Werte des Charakterbogens.
// Würfelbare Werte landen zusätzlich in `checks`; der Server würfelt nur über diese Liste.

export type Check = { label: string; dice: string };

export type SheetSpell = Spell & { checks: { attack?: string; damage?: string; healing?: string } };
export type SpellGroup = {
  source: string;
  ability: AbilityId;
  saveDc: number;
  attackBonus: number;
  slots?: number;
  note?: string;
  cantrips: SheetSpell[];
  spells: SheetSpell[];
};

export type Sheet = {
  level: number;
  proficiencyBonus: number;
  speciesName: string;
  className: string;
  backgroundName: string;
  size: string;
  scores: Record<AbilityId, number>;
  mods: Record<AbilityId, number>;
  saves: { ability: AbilityId; bonus: number; proficient: boolean }[];
  skills: { id: SkillId; name: string; ability: AbilityId; bonus: number; proficient: boolean; expertise: boolean }[];
  hpMax: number;
  hitDice: string;
  ac: number;
  acNote: string;
  initiative: number;
  speed: number;
  armorWarnings: string[];
  darkvision?: number;
  passivePerception: number;
  attacks: { key: string; name: string; toHit: number; damage: string; damageType: string; notes: string[] }[];
  spellGroups: SpellGroup[];
  features: { name: string; summary: string; source: string; check?: string }[];
  proficiencies: { armor: string[]; weapons: string[]; tools: string[]; languages: string[] };
  resistances: string[];
  equipment: Item[];
  gold: number;
  checks: Record<string, Check>;
};

const withMod = (dice: string, mod: number) => (mod === 0 ? dice : `${dice}${mod > 0 ? "+" : ""}${mod}`);

export function computeSheet(build: CharacterBuild, level = 1): Sheet {
  const species = SPECIES_BY_ID[build.species];
  const option = species?.option?.options.find((o) => o.id === build.speciesOption);
  const cls = CLASS_BY_ID[build.class];
  const bg = BACKGROUND_BY_ID[build.background];
  if (!species || !cls || !bg) throw new Error("Unvollständiger Charakter");

  const pb = proficiencyBonus(level);
  const checks: Record<string, Check> = {};

  // Attribute
  const scores = {} as Record<AbilityId, number>;
  const mods = {} as Record<AbilityId, number>;
  for (const a of ABILITY_IDS) {
    scores[a] = (build.baseScores[a] ?? 10) + (build.backgroundBonus[a] ?? 0);
    mods[a] = abilityMod(scores[a]);
  }
  for (const a of ABILITIES) checks[`ability:${a.id}`] = { label: `${a.name}swurf`, dice: withMod("1W20", mods[a.id]) };

  // Rettungswürfe
  const saves = ABILITY_IDS.map((a) => {
    const proficient = cls.saves.includes(a);
    const bonus = mods[a] + (proficient ? pb : 0);
    checks[`save:${a}`] = { label: `${ABILITIES.find((x) => x.id === a)!.name}srettungswurf`, dice: withMod("1W20", bonus) };
    return { ability: a, bonus, proficient };
  });

  // Fertigkeiten
  const prof = new Set(proficientSkills(build));
  const thaumaturge = cls.id === "cleric" && build.divineOrder === "thaumaturge";
  const skills = SKILLS.map((s) => {
    const proficient = prof.has(s.id);
    const expertise = build.expertise.includes(s.id);
    let bonus = mods[s.ability] + (expertise ? 2 * pb : proficient ? pb : 0);
    if (thaumaturge && (s.id === "arcana" || s.id === "religion")) bonus += Math.max(1, mods.wis);
    checks[`skill:${s.id}`] = { label: s.name, dice: withMod("1W20", bonus) };
    return { ...s, bonus, proficient, expertise };
  });
  const perception = skills.find((s) => s.id === "perception")!;

  // Trefferpunkte
  const hpMax = Math.max(1, cls.hitDie + mods.con + (level - 1) * (cls.hitDie / 2 + 1 + mods.con) + (species.hpPerLevel ?? 0) * level);

  // Ausrüstung
  const classEq = cls.equipment.find((o) => o.id === build.classEquipment);
  const bgEq = bg.equipment.find((o) => o.id === build.backgroundEquipment);
  const equipment: Item[] = [...(classEq?.items ?? []), ...(bgEq?.items ?? [])].map((it) =>
    it.name === "Spielset" && build.gamingSet ? { ...it, name: `Spielset (${GAMING_SETS.find((g) => g.id === build.gamingSet)?.name})` } : it,
  );
  const gold = (classEq?.gold ?? 0) + (bgEq?.gold ?? 0);

  // Übung in Rüstung und Waffen
  const protector = cls.id === "cleric" && build.divineOrder === "protector";
  const armorTraining = new Set<string>(cls.armor);
  if (protector) armorTraining.add("heavy");
  const martial = cls.weapons === "simpleMartial" || protector;
  const proficientWith = (wpn: Weapon) =>
    wpn.category === "simple" || martial || (cls.weapons === "rogue" && (wpn.properties.includes("finesse") || wpn.properties.includes("light")));

  // Rüstungsklasse: beste getragene Rüstung, in der der Charakter geübt ist, plus Schild
  const armors = equipment.map((it) => (it.armor ? ARMOR_BY_ID[it.armor] : undefined)).filter((a) => a && armorTraining.has(a.category));
  let ac = 10 + mods.dex;
  let acNote = "ohne Rüstung";
  let worn: (typeof ARMOR_BY_ID)[string] | undefined;
  for (const a of armors) {
    if (!a || a.category === "shield") continue;
    const dex = a.maxDex === undefined ? mods.dex : Math.min(mods.dex, a.maxDex);
    const value = a.baseAc + dex;
    if (!worn || value > ac) {
      ac = value;
      acNote = a.name;
      worn = a;
    }
  }
  const wearingArmor = Boolean(worn);
  // Zu schwere Rüstung: Bewegungsrate −3 m
  const armorSlow = worn?.strength && scores.str < worn.strength ? 3 : 0;
  if (armors.some((a) => a?.category === "shield")) {
    ac += 2;
    acNote += " + Schild";
  }
  if (build.fightingStyle === "defense" && wearingArmor) {
    ac += 1;
    acNote += " + Verteidigung";
  }

  // Talente
  const feats = [FEAT_BY_ID[bg.feat], build.fightingStyle ? FEAT_BY_ID[build.fightingStyle] : undefined, build.speciesFeat ? FEAT_BY_ID[build.speciesFeat.id] : undefined].filter(
    Boolean,
  ) as (typeof FEAT_BY_ID)[string][];
  const hasFeat = (id: string) => feats.some((f) => f.id === id);

  const initiative = mods.dex + (hasFeat("alert") ? pb : 0);
  checks.initiative = { label: "Initiative", dice: withMod("1W20", initiative) };

  // Angriffe
  const attacks: Sheet["attacks"] = [];
  const seen = new Set<string>();
  for (const it of equipment) {
    if (!it.weapon || seen.has(it.weapon)) continue;
    seen.add(it.weapon);
    const wpn = WEAPON_BY_ID[it.weapon];
    const ab = weaponAbility(wpn, scores);
    const toHit = mods[ab] + (proficientWith(wpn) ? pb : 0) + (wpn.ranged && build.fightingStyle === "archery" ? 2 : 0);
    const notes: string[] = [];
    if (wpn.versatile) notes.push(`zweihändig ${withMod(wpn.versatile, mods[ab])}`);
    if (wpn.range) notes.push(`Reichweite ${wpn.range}`);
    if (build.weaponMasteries.includes(wpn.id)) notes.push(`Meisterschaft: ${MASTERIES[wpn.mastery].name}`);
    if (!proficientWith(wpn)) notes.push("nicht geübt");
    const key = `weapon-${wpn.id}`;
    attacks.push({ key, name: wpn.name, toHit, damage: withMod(wpn.damage, mods[ab]), damageType: wpn.damageType, notes });
    checks[`attack:${key}`] = { label: `Angriff: ${wpn.name}`, dice: withMod("1W20", toHit) };
    checks[`damage:${key}`] = { label: `Schaden: ${wpn.name}`, dice: withMod(wpn.damage, mods[ab]) };
  }
  // Waffenloser Schlag
  attacks.push({ key: "unarmed", name: "Waffenloser Schlag", toHit: mods.str + pb, damage: String(Math.max(1, 1 + mods.str)), damageType: "Wucht", notes: [] });
  checks["attack:unarmed"] = { label: "Angriff: Waffenloser Schlag", dice: withMod("1W20", mods.str + pb) };

  // Zauber
  const spellGroups: SpellGroup[] = [];
  const makeGroup = (source: string, ability: AbilityId, cantripIds: string[], spellIds: string[], extra: Partial<SpellGroup> = {}) => {
    const attackBonus = pb + mods[ability];
    const toSheetSpell = (id: string): SheetSpell | null => {
      const sp = SPELL_BY_ID[id];
      if (!sp) return null;
      const keyBase = `${source}:${sp.id}`;
      const c: SheetSpell["checks"] = {};
      if (sp.attack) {
        c.attack = `spell-attack:${keyBase}`;
        checks[c.attack] = { label: `Zauberangriff: ${sp.name}`, dice: withMod("1W20", attackBonus) };
      }
      if (sp.damage) {
        c.damage = `spell-damage:${keyBase}`;
        checks[c.damage] = { label: `Schaden: ${sp.name}`, dice: sp.damage };
      }
      if (sp.healing) {
        c.healing = `spell-heal:${keyBase}`;
        const dice = sp.healing.replace("+MOD", mods[ability] >= 0 ? `+${mods[ability]}` : `${mods[ability]}`);
        checks[c.healing] = { label: `Heilung: ${sp.name}`, dice };
      }
      return { ...sp, checks: c };
    };
    spellGroups.push({
      source,
      ability,
      saveDc: 8 + pb + mods[ability],
      attackBonus,
      cantrips: cantripIds.map(toSheetSpell).filter(Boolean) as SheetSpell[],
      spells: spellIds.map(toSheetSpell).filter(Boolean) as SheetSpell[],
      ...extra,
    });
  };
  if (cls.spellcasting) {
    const sc = cls.spellcasting;
    makeGroup(cls.name, sc.ability, build.cantrips, build.prepared, {
      slots: sc.slots,
      note: sc.spellbook
        ? `Zauberbuch: ${build.spellbook.map((id) => SPELL_BY_ID[id]?.name ?? id).join(", ")}`
        : undefined,
    });
  }
  const featSpells = (choice: CharacterBuild["backgroundFeat"] | undefined, list: string | undefined) => {
    if (!choice || choice.id !== "magic-initiate" || !choice.ability) return;
    makeGroup(`Magie-Eingeweihter (${list === "cleric" ? "Kleriker" : "Magier"})`, choice.ability as CasterAbility, choice.cantrips ?? [], choice.spell ? [choice.spell] : [], {
      note: "Den Zauber des 1. Grades einmal pro langer Rast ohne Zauberplatz.",
    });
  };
  featSpells(build.backgroundFeat, bg.featSpellList);
  featSpells(build.speciesFeat, build.speciesFeat?.list);
  const speciesCantrips = [...(species.cantrips ?? []), ...(option?.cantrips ?? [])].filter((id) => SPELL_BY_ID[id]);
  if (speciesCantrips.length > 0 && build.speciesSpellAbility) {
    makeGroup(species.name, build.speciesSpellAbility, speciesCantrips, []);
  }

  // Merkmale
  const features: Sheet["features"] = [];
  for (const t of species.traits) features.push({ name: t.name, summary: t.summary, source: species.name });
  if (option && species.option) features.push({ name: `${species.option.label}: ${option.name}`, summary: option.summary, source: species.name });
  if (species.breathWeapon) {
    const dc = 8 + mods.con + pb;
    checks["feature:breath"] = { label: `Odemwaffe (GE-Rettungswurf SG ${dc})`, dice: "1W10" };
    features.push({ name: "Odemwaffe – Schaden", summary: `GE-Rettungswurf gegen SG ${dc}, ${pb}-mal pro langer Rast.`, source: species.name, check: "feature:breath" });
  }
  for (const f of cls.features) {
    const entry: Sheet["features"][number] = { name: f.name, summary: f.summary, source: cls.name };
    if (cls.id === "fighter" && f.name === "Durchatmen") {
      checks["feature:second-wind"] = { label: "Durchatmen (Heilung)", dice: `1W10+${level}` };
      entry.check = "feature:second-wind";
    }
    if (cls.id === "rogue" && f.name === "Hinterhältiger Angriff") {
      checks["feature:sneak-attack"] = { label: "Hinterhältiger Angriff", dice: "1W6" };
      entry.check = "feature:sneak-attack";
    }
    if (f.name === "Waffenmeisterschaft" && build.weaponMasteries.length) {
      entry.summary += ` Gewählt: ${build.weaponMasteries
        .map((id) => `${WEAPON_BY_ID[id]?.name} (${MASTERIES[WEAPON_BY_ID[id]?.mastery]?.name})`)
        .join(", ")}.`;
    }
    if (f.name === "Expertise" && build.expertise.length) {
      entry.summary += ` Gewählt: ${build.expertise.map((s) => SKILLS.find((x) => x.id === s)?.name).join(", ")}.`;
    }
    features.push(entry);
  }
  const order = DIVINE_ORDERS.find((o) => o.id === build.divineOrder);
  if (cls.id === "cleric" && order) features.push({ name: `Göttliche Ordnung: ${order.name}`, summary: order.summary, source: cls.name });
  for (const f of feats) features.push({ name: f.name, summary: f.summary, source: "Talent" });

  const languages = ["Gemeinsprache", ...build.languages.map((l) => LANGUAGE_NAME[l] ?? l)];
  if (cls.id === "rogue") languages.push("Diebessprache");

  const tools = [...cls.tools];
  const bgTool = bg.tool === "gaming-set" ? `Spielset (${GAMING_SETS.find((g) => g.id === build.gamingSet)?.name ?? "?"})` : bg.tool;
  if (!tools.includes(bgTool)) tools.push(bgTool);

  const resistances = [species.resistance, option?.resistance].filter(Boolean) as string[];

  return {
    level,
    proficiencyBonus: pb,
    speciesName: option && species.id === "elf" ? option.name : species.name,
    className: cls.name,
    backgroundName: bg.name,
    size: species.size === "choice" ? SIZE_NAME[build.size ?? "medium"] : SIZE_NAME[species.size],
    scores,
    mods,
    saves,
    skills,
    hpMax,
    hitDice: `${level}W${cls.hitDie}`,
    ac,
    acNote,
    initiative,
    speed: (option?.speed ?? species.speed) - armorSlow,
    armorWarnings: [
      ...(armorSlow ? [`${worn!.name} erfordert Stärke ${worn!.strength}: Bewegungsrate −3 m`] : []),
      ...(worn?.stealthDisadvantage ? [`${worn.name}: Nachteil auf Heimlichkeit`] : []),
    ],
    darkvision: option?.darkvision ?? species.darkvision,
    passivePerception: 10 + perception.bonus,
    attacks,
    spellGroups,
    features,
    proficiencies: {
      armor: [...armorTraining].map((a) => ARMOR_CATEGORY_NAME[a as keyof typeof ARMOR_CATEGORY_NAME]),
      weapons: [martial ? "einfache Waffen, Kriegswaffen" : cls.weapons === "rogue" ? "einfache Waffen, Kriegswaffen mit Finesse oder Leicht" : "einfache Waffen"],
      tools,
      languages,
    },
    resistances,
    equipment,
    gold,
    checks,
  };
}

export const formatBonus = signed;
export { ABILITY_SHORT };
