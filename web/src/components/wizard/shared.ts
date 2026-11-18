import { skillSources, type CharacterBuild } from "@/rules/build";
import type { SkillId } from "@/rules/types";

export type StepProps = {
  build: CharacterBuild;
  set: (patch: Partial<CharacterBuild>) => void;
};

const SOURCE_LABEL = { background: "Hintergrund", class: "Klasse", species: "Spezies", feat: "Talent" } as const;

// Fertigkeiten, die schon aus einer anderen Quelle kommen – mit Grund für den Tooltip
export function blockedSkills(build: CharacterBuild, editing: keyof typeof SOURCE_LABEL, exclude: SkillId[] = []): Partial<Record<SkillId, string>> {
  const sources = skillSources(build);
  const out: Partial<Record<SkillId, string>> = {};
  for (const key of Object.keys(sources) as (keyof typeof sources)[]) {
    if (key === editing) continue;
    for (const s of sources[key]) if (!exclude.includes(s)) out[s] = `Schon durch ${SOURCE_LABEL[key]}`;
  }
  return out;
}
