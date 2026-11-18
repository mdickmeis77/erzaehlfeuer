"use client";

import { useState } from "react";
import { BACKGROUNDS, BACKGROUND_BY_ID } from "@/rules/backgrounds";
import { proficientSkills } from "@/rules/build";
import { ABILITY_NAME, GAMING_SETS, LANGUAGES, SKILL_BY_ID } from "@/rules/core";
import { FEAT_BY_ID } from "@/rules/feats";
import { FeatEditor } from "./FeatEditor";
import { blockedSkills, type StepProps } from "./shared";
import { ChipPicker, ChoiceGrid, Pills, Section } from "./ui";

export function StepBackground({ build, set }: StepProps) {
  const bg = BACKGROUND_BY_ID[build.background];
  const langCount = 2 + (build.class === "rogue" ? 1 : 0);
  const [dropped, setDropped] = useState<string | null>(null);

  // Bringt der Hintergrund Fertigkeiten mit, die schon bei Klasse oder Spezies gewählt sind,
  // werden sie dort abgewählt – sonst stünde man vor einem Fehler, den man erst rückwärts suchen muss.
  const selectBackground = (id: string) => {
    if (id === build.background) return;
    const fixed: string[] = BACKGROUND_BY_ID[id].skills;
    const clash = [...build.classSkills, ...build.speciesSkills].filter((s) => fixed.includes(s));
    set({
      background: id,
      backgroundFeat: { id: BACKGROUND_BY_ID[id].feat },
      gamingSet: undefined,
      backgroundBonus: {},
      backgroundEquipment: "",
      classSkills: build.classSkills.filter((s) => !fixed.includes(s)),
      speciesSkills: build.speciesSkills.filter((s) => !fixed.includes(s)),
    });
    setDropped(clash.length ? clash.map((s) => SKILL_BY_ID[s].name).join(" und ") : null);
  };

  return (
    <div>
      <p className="hint mb-3">Der Hintergrund erzählt, was dein Charakter vor dem Abenteuer war. Er bringt Attributsboni, ein Talent und Fertigkeiten.</p>
      <ChoiceGrid
        items={BACKGROUNDS}
        selected={build.background}
        onSelect={selectBackground}
        render={(b) => (
          <>
            <span className="font-semibold">{b.name}</span>
            <span className="hint mt-1 block">{b.summary}</span>
          </>
        )}
      />

      {dropped && (
        <p className="card mt-4 border-ember" role="status">
          Dein Hintergrund bringt {dropped} schon mit. Darum wurde das bei Klasse oder Spezies abgewählt – wähle dort bitte eine andere Fertigkeit.
        </p>
      )}

      {bg && (
        <div className="mt-6 border-t border-line pt-4">
          <h2 className="h2">{bg.name}</h2>
          <dl className="grid gap-2 sm:grid-cols-[10rem_1fr]">
            <dt className="hint">Attributsboni</dt>
            <dd>{bg.abilities.map((a) => ABILITY_NAME[a]).join(", ")} (verteilst du im Schritt „Werte“)</dd>
            <dt className="hint">Fertigkeiten</dt>
            <dd>{bg.skills.map((s) => SKILL_BY_ID[s].name).join(", ")}</dd>
            <dt className="hint">Werkzeug</dt>
            <dd>{bg.tool === "gaming-set" ? "Ein Spielset deiner Wahl" : bg.tool}</dd>
            <dt className="hint">Talent</dt>
            <dd>{FEAT_BY_ID[bg.feat].name}</dd>
          </dl>

          <FeatEditor choice={build.backgroundFeat} fixedList={bg.featSpellList} blockedSkills={blockedSkills(build, "feat")} onChange={(backgroundFeat) => set({ backgroundFeat })} />

          {bg.tool === "gaming-set" && (
            <Section title="Spielset">
              <div className="flex flex-wrap gap-2">
                {GAMING_SETS.map((g) => (
                  <button key={g.id} type="button" className="chip" aria-pressed={build.gamingSet === g.id} onClick={() => set({ gamingSet: g.id })}>
                    {g.name}
                  </button>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      <Section title={`Sprachen (${langCount})`} hint={`Die Gemeinsprache kannst du immer.${build.class === "rogue" ? " Als Schurke kennst du zusätzlich die Diebessprache und wählst eine weitere Sprache." : ""}`}>
        <ChipPicker options={LANGUAGES.map((l) => ({ id: l.id, label: l.name }))} selected={build.languages} max={langCount} onChange={(languages) => set({ languages })} />
      </Section>

      {build.class === "rogue" && (
        <Section title="Expertise (2)" hint="In diesen Fertigkeiten verdoppelt sich dein Übungsbonus. Heimlichkeit und Wahrnehmung sind beliebt.">
          {(() => {
            const prof = proficientSkills(build);
            return prof.length === 0 ? (
              <p className="hint">Wähle zuerst Fertigkeiten bei Klasse und Hintergrund.</p>
            ) : (
              <>
                <ChipPicker
                  options={prof.map((id) => ({ id, label: SKILL_BY_ID[id].name }))}
                  selected={build.expertise.filter((s) => prof.includes(s))}
                  max={2}
                  onChange={(expertise) => set({ expertise })}
                />
              </>
            );
          })()}
        </Section>
      )}

      {bg && (
        <div className="mt-6">
          <p className="hint mb-1">Deine Fertigkeiten bisher</p>
          <Pills items={proficientSkills(build).map((s) => SKILL_BY_ID[s].name)} />
        </div>
      )}
    </div>
  );
}
