"use client";

import type { CasterAbility, FeatChoice } from "@/rules/build";
import { ABILITY_NAME, SKILLS } from "@/rules/core";
import { FEAT_BY_ID, SKILLED_COUNT } from "@/rules/feats";
import { SPELLS } from "@/rules/spells";
import type { SkillId, SpellList } from "@/rules/types";
import { ChipPicker, Section, SpellPicker } from "./ui";

const CASTER: CasterAbility[] = ["int", "wis", "cha"];

// Auswahl innerhalb eines Herkunftstalents (Zauber bei Magie-Eingeweihter, Fertigkeiten bei Vielseitig begabt)
export function FeatEditor({
  choice,
  fixedList,
  onChange,
  blockedSkills,
}: {
  choice: FeatChoice;
  fixedList?: SpellList;
  onChange: (next: FeatChoice) => void;
  blockedSkills: Partial<Record<SkillId, string>>;
}) {
  const feat = FEAT_BY_ID[choice.id];
  if (!feat) return null;

  if (feat.id === "magic-initiate") {
    const list = fixedList ?? choice.list;
    return (
      <div className="card mt-3">
        <p className="font-semibold">{feat.name}</p>
        <p className="hint">{feat.summary}</p>
        {!fixedList && (
          <Section title="Zauberliste">
            <div className="flex gap-2">
              {(["cleric", "wizard"] as const).map((l) => (
                <button key={l} type="button" className="chip" aria-pressed={choice.list === l} onClick={() => onChange({ ...choice, list: l, cantrips: [], spell: undefined })}>
                  {l === "cleric" ? "Kleriker" : "Magier"}
                </button>
              ))}
            </div>
          </Section>
        )}
        {list && (
          <>
            <Section title="Zwei Zaubertricks">
              <SpellPicker
                ids={SPELLS.filter((s) => s.level === 0 && s.lists.includes(list)).map((s) => s.id)}
                selected={choice.cantrips ?? []}
                max={2}
                onChange={(cantrips) => onChange({ ...choice, cantrips })}
              />
            </Section>
            <Section title="Ein Zauber des 1. Grades">
              <SpellPicker
                ids={SPELLS.filter((s) => s.level === 1 && s.lists.includes(list)).map((s) => s.id)}
                selected={choice.spell ? [choice.spell] : []}
                max={1}
                onChange={(next) => onChange({ ...choice, spell: next[next.length - 1] })}
              />
            </Section>
          </>
        )}
        <Section title="Attribut für diese Zauber">
          <div className="flex flex-wrap gap-2">
            {CASTER.map((a) => (
              <button key={a} type="button" className="chip" aria-pressed={choice.ability === a} onClick={() => onChange({ ...choice, ability: a })}>
                {ABILITY_NAME[a]}
              </button>
            ))}
          </div>
        </Section>
      </div>
    );
  }

  if (feat.id === "skilled") {
    return (
      <div className="card mt-3">
        <p className="font-semibold">{feat.name}</p>
        <Section title={`${SKILLED_COUNT} Fertigkeiten`}>
          <ChipPicker
            options={SKILLS.map((s) => ({ id: s.id, label: s.name }))}
            selected={choice.skills ?? []}
            max={SKILLED_COUNT}
            blocked={blockedSkills}
            onChange={(skills) => onChange({ ...choice, skills })}
          />
        </Section>
      </div>
    );
  }

  return (
    <div className="card mt-3">
      <p className="font-semibold">{feat.name}</p>
      <p className="hint">{feat.summary}</p>
    </div>
  );
}
