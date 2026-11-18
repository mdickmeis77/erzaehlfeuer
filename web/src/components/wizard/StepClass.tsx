"use client";

import { MASTERABLE_WEAPONS } from "@/rules/build";
import { CLASSES, CLASS_BY_ID, DIVINE_ORDERS } from "@/rules/classes";
import { ABILITY_NAME, SKILL_BY_ID } from "@/rules/core";
import { MASTERIES } from "@/rules/equipment";
import { FIGHTING_STYLES } from "@/rules/feats";
import { SPELLS } from "@/rules/spells";
import { blockedSkills, type StepProps } from "./shared";
import { ChipPicker, ChoiceGrid, Section, SpellPicker } from "./ui";

export function StepClass({ build, set }: StepProps) {
  const cls = build.class ? CLASS_BY_ID[build.class] : undefined;
  const sc = cls?.spellcasting;
  const cantripCount = sc ? sc.cantrips + (cls?.id === "cleric" && build.divineOrder === "thaumaturge" ? 1 : 0) : 0;

  return (
    <div>
      <p className="hint mb-3">Die Klasse ist der Beruf deines Charakters: Wie er kämpft, was er kann und ob er zaubert.</p>
      <ChoiceGrid
        items={CLASSES}
        selected={build.class}
        onSelect={(id) =>
          id !== build.class &&
          set({
            class: id as typeof build.class,
            classSkills: [],
            fightingStyle: undefined,
            divineOrder: undefined,
            expertise: [],
            weaponMasteries: [],
            cantrips: [],
            spellbook: [],
            prepared: [],
            classEquipment: "",
          })
        }
        render={(c) => (
          <>
            <span className="flex items-baseline justify-between gap-2">
              <span className="font-semibold">{c.name}</span>
              <span className="hint text-xs">W{c.hitDie} · {c.primary.map((a) => ABILITY_NAME[a]).join(" / ")}</span>
            </span>
            <span className="hint mt-1 block">{c.summary}</span>
          </>
        )}
      />

      {cls && (
        <div className="mt-6 border-t border-line pt-4">
          <h2 className="h2">{cls.name}</h2>
          <p className="hint">
            Trefferwürfel W{cls.hitDie} · Rettungswürfe {cls.saves.map((a) => ABILITY_NAME[a]).join(", ")}
          </p>
          <ul className="mt-3 space-y-2">
            {cls.features.map((f) => (
              <li key={f.name}>
                <span className="font-semibold">{f.name}:</span> <span className="text-muted">{f.summary}</span>
              </li>
            ))}
          </ul>

          <Section title={`Fertigkeiten (${cls.skillChoice.count})`} hint={build.background ? undefined : "Dein Hintergrund bringt später noch zwei Fertigkeiten mit. Doppelte werden dann automatisch abgewählt."}>
            <ChipPicker
              options={cls.skillChoice.from.map((id) => ({ id, label: SKILL_BY_ID[id].name }))}
              selected={build.classSkills}
              max={cls.skillChoice.count}
              blocked={blockedSkills(build, "class")}
              onChange={(classSkills) => set({ classSkills, expertise: build.expertise.filter((s) => classSkills.includes(s) || !build.classSkills.includes(s)) })}
            />
          </Section>

          {cls.id === "fighter" && (
            <Section title="Kampfstil">
              <ChoiceGrid
                items={FIGHTING_STYLES}
                selected={build.fightingStyle}
                onSelect={(id) => set({ fightingStyle: id })}
                render={(f) => (
                  <>
                    <span className="font-semibold">{f.name.replace("Kampfstil: ", "")}</span>
                    <span className="hint mt-1 block">{f.summary}</span>
                  </>
                )}
              />
            </Section>
          )}

          {cls.id === "cleric" && (
            <Section title="Göttliche Ordnung">
              <ChoiceGrid
                items={[...DIVINE_ORDERS]}
                selected={build.divineOrder}
                onSelect={(id) => set({ divineOrder: id as typeof build.divineOrder, cantrips: id === "protector" ? build.cantrips.slice(0, 3) : build.cantrips })}
                render={(o) => (
                  <>
                    <span className="font-semibold">{o.name}</span>
                    <span className="hint mt-1 block">{o.summary}</span>
                  </>
                )}
              />
            </Section>
          )}

          {cls.weaponMasteries > 0 && (
            <Section title={`Waffenmeisterschaft (${cls.weaponMasteries})`} hint="Wähle Waffen, die du im Kampf nutzen willst. Ihre Meisterschaft gibt dir einen Zusatzeffekt.">
              <ChipPicker
                options={MASTERABLE_WEAPONS(cls.id).map((w) => ({ id: w.id, label: `${w.name} · ${MASTERIES[w.mastery].name}` }))}
                selected={build.weaponMasteries}
                max={cls.weaponMasteries}
                onChange={(weaponMasteries) => set({ weaponMasteries })}
              />
            </Section>
          )}

          {sc && (
            <>
              <Section title={`Zaubertricks (${cantripCount})`} hint="Zaubertricks kannst du beliebig oft wirken.">
                <SpellPicker
                  ids={SPELLS.filter((s) => s.level === 0 && s.lists.includes(sc.list)).map((s) => s.id)}
                  selected={build.cantrips}
                  max={cantripCount}
                  onChange={(cantrips) => set({ cantrips })}
                />
              </Section>
              {sc.spellbook ? (
                <>
                  <Section title={`Zauberbuch (${sc.spellbook})`} hint="Diese Zauber stehen in deinem Zauberbuch.">
                    <SpellPicker
                      ids={SPELLS.filter((s) => s.level === 1 && s.lists.includes(sc.list)).map((s) => s.id)}
                      selected={build.spellbook}
                      max={sc.spellbook}
                      onChange={(spellbook) => set({ spellbook, prepared: build.prepared.filter((p) => spellbook.includes(p)) })}
                    />
                  </Section>
                  <Section title={`Vorbereitete Zauber (${sc.prepared})`} hint={`Aus deinem Zauberbuch. Du hast ${sc.slots} Zauberplätze des 1. Grades.`}>
                    {build.spellbook.length === 0 ? (
                      <p className="hint">Wähle zuerst Zauber für dein Zauberbuch.</p>
                    ) : (
                      <SpellPicker ids={build.spellbook} selected={build.prepared} max={sc.prepared} onChange={(prepared) => set({ prepared })} />
                    )}
                  </Section>
                </>
              ) : (
                <Section title={`Vorbereitete Zauber (${sc.prepared})`} hint={`Du hast ${sc.slots} Zauberplätze des 1. Grades. Nach jeder langen Rast kannst du neu wählen.`}>
                  <SpellPicker
                    ids={SPELLS.filter((s) => s.level === 1 && s.lists.includes(sc.list)).map((s) => s.id)}
                    selected={build.prepared}
                    max={sc.prepared}
                    onChange={(prepared) => set({ prepared })}
                  />
                </Section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
