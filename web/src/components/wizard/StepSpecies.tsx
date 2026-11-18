"use client";

import { ABILITY_NAME, SKILLS, SKILL_BY_ID } from "@/rules/core";
import { ORIGIN_FEATS } from "@/rules/feats";
import { SIZE_NAME, SPECIES, SPECIES_BY_ID } from "@/rules/species";
import { FeatEditor } from "./FeatEditor";
import { blockedSkills, type StepProps } from "./shared";
import { ChipPicker, ChoiceGrid, Section } from "./ui";

export function StepSpecies({ build, set }: StepProps) {
  const species = SPECIES_BY_ID[build.species];

  return (
    <div>
      <p className="hint mb-3">Deine Spezies bestimmt Größe, Bewegungsrate und besondere Fähigkeiten. Attributsboni kommen in diesen Regeln vom Hintergrund.</p>
      <ChoiceGrid
        items={SPECIES}
        selected={build.species}
        onSelect={(id) =>
          id !== build.species &&
          set({ species: id, speciesOption: undefined, size: undefined, speciesSkills: [], speciesSpellAbility: undefined, speciesFeat: undefined })
        }
        render={(s) => (
          <>
            <span className="font-semibold">{s.name}</span>
            <span className="hint mt-1 block">{s.summary}</span>
          </>
        )}
      />

      {species && (
        <div className="mt-6 border-t border-line pt-4">
          <h2 className="h2">{species.name}</h2>
          <p className="hint">
            {species.size === "choice" ? "Mittelgroß oder klein" : SIZE_NAME[species.size]} · Bewegungsrate {String(species.speed).replace(".", ",")} m
            {species.darkvision ? ` · Dunkelsicht ${species.darkvision} m` : ""}
          </p>
          <ul className="mt-3 space-y-2">
            {species.traits.map((t) => (
              <li key={t.name}>
                <span className="font-semibold">{t.name}:</span> <span className="text-muted">{t.summary}</span>
              </li>
            ))}
          </ul>

          {species.option && (
            <Section title={species.option.label}>
              <ChoiceGrid
                items={species.option.options}
                selected={build.speciesOption}
                onSelect={(id) => set({ speciesOption: id })}
                render={(o) => (
                  <>
                    <span className="font-semibold">{o.name}</span>
                    <span className="hint mt-1 block">{o.summary}</span>
                  </>
                )}
              />
            </Section>
          )}

          {species.size === "choice" && (
            <Section title="Größe">
              <div className="flex gap-2">
                {(["medium", "small"] as const).map((s) => (
                  <button key={s} type="button" className="chip" aria-pressed={build.size === s} onClick={() => set({ size: s })}>
                    {SIZE_NAME[s]}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {species.spellAbilityChoice && (
            <Section title="Attribut für Zauber der Spezies" hint="Damit wirkst du die Zaubertricks deiner Spezies. Nimm am besten dein stärkstes geistiges Attribut.">
              <div className="flex flex-wrap gap-2">
                {(["int", "wis", "cha"] as const).map((a) => (
                  <button key={a} type="button" className="chip" aria-pressed={build.speciesSpellAbility === a} onClick={() => set({ speciesSpellAbility: a })}>
                    {ABILITY_NAME[a]}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {species.skillChoice && (
            <Section title={species.skillChoice.label}>
              <ChipPicker
                options={(species.skillChoice.from === "any" ? SKILLS.map((s) => s.id) : species.skillChoice.from).map((id) => ({ id, label: SKILL_BY_ID[id].name }))}
                selected={build.speciesSkills}
                max={species.skillChoice.count}
                blocked={blockedSkills(build, "species")}
                onChange={(speciesSkills) => set({ speciesSkills })}
              />
            </Section>
          )}

          {species.originFeat && (
            <Section title="Vielseitig: Herkunftstalent">
              <ChoiceGrid
                items={ORIGIN_FEATS}
                selected={build.speciesFeat?.id}
                onSelect={(id) => set({ speciesFeat: { id } })}
                render={(f) => (
                  <>
                    <span className="font-semibold">{f.name}</span>
                    <span className="hint mt-1 block">{f.summary}</span>
                  </>
                )}
              />
              {build.speciesFeat && (
                <FeatEditor choice={build.speciesFeat} blockedSkills={blockedSkills(build, "feat", build.speciesFeat.skills)} onChange={(speciesFeat) => set({ speciesFeat })} />
              )}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
