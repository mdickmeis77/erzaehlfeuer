import { ABILITIES, ABILITY_SHORT, signed } from "@/rules/core";
import type { Sheet } from "@/rules/sheet";
import { RollButton } from "./RollPanel";

const m = (n: number) => String(n).replace(".", ",");

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      <h2 className="h2">{title}</h2>
      {children}
    </section>
  );
}

// Der vollständige Bogen. Alle würfelbaren Werte sind Knöpfe (RollButton).
export function CharacterSheet({ sheet }: { sheet: Sheet }) {
  const c = sheet.checks;
  return (
    <div className="space-y-4">
      {/* Kampfwerte */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        <div className="stat">
          <div className="stat-label">Rüstung</div>
          <div className="stat-value">{sheet.ac}</div>
          <div className="hint text-xs">{sheet.acNote}</div>
        </div>
        <RollButton check="initiative" label={c.initiative.label} dice={c.initiative.dice} className="stat">
          <div className="stat-label">Initiative</div>
          <div className="stat-value">{signed(sheet.initiative)}</div>
        </RollButton>
        <div className="stat">
          <div className="stat-label">Bewegung</div>
          <div className="stat-value">{m(sheet.speed)} m</div>
        </div>
        <div className="stat">
          <div className="stat-label">Übung</div>
          <div className="stat-value">{signed(sheet.proficiencyBonus)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Passive Wahrn.</div>
          <div className="stat-value">{sheet.passivePerception}</div>
        </div>
      </div>
      {sheet.armorWarnings.length > 0 && <p className="hint">{sheet.armorWarnings.join(" · ")}</p>}

      {/* Attribute und Rettungswürfe */}
      <Card title="Attribute">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {ABILITIES.map((a) => {
            const save = sheet.saves.find((s) => s.ability === a.id)!;
            return (
              <div key={a.id} className="space-y-1">
                <RollButton check={`ability:${a.id}`} label={c[`ability:${a.id}`].label} dice={c[`ability:${a.id}`].dice} className="stat w-full">
                  <div className="stat-label">{a.short}</div>
                  <div className="stat-value">{signed(sheet.mods[a.id])}</div>
                  <div className="hint text-xs">{sheet.scores[a.id]}</div>
                </RollButton>
                <RollButton check={`save:${a.id}`} label={c[`save:${a.id}`].label} dice={c[`save:${a.id}`].dice} className="rollable !justify-center text-sm">
                  <span className={`dot ${save.proficient ? "dot-on" : ""}`} aria-hidden />
                  <span>RW {signed(save.bonus)}</span>
                </RollButton>
              </div>
            );
          })}
        </div>
        <p className="hint mt-2">Tippe auf einen Wert, um zu würfeln. RW = Rettungswurf, ● = geübt.</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Fertigkeiten">
          <ul>
            {sheet.skills.map((s) => (
              <li key={s.id}>
                <RollButton check={`skill:${s.id}`} label={c[`skill:${s.id}`].label} dice={c[`skill:${s.id}`].dice}>
                  <span className="flex items-center gap-2">
                    <span className={`dot ${s.expertise ? "dot-double" : s.proficient ? "dot-on" : ""}`} aria-label={s.expertise ? "Expertise" : s.proficient ? "geübt" : undefined} />
                    {s.name}
                    <span className="hint text-xs">{ABILITY_SHORT[s.ability]}</span>
                  </span>
                  <span className="font-semibold">{signed(s.bonus)}</span>
                </RollButton>
              </li>
            ))}
          </ul>
          <p className="hint mt-2">● geübt · ◉ Expertise</p>
        </Card>

        <div className="space-y-4">
          <Card title="Angriffe">
            <ul className="space-y-2">
              {sheet.attacks.map((a) => (
                <li key={a.key} className="rounded-lg border border-line p-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex-1 font-semibold">{a.name}</span>
                    <RollButton check={`attack:${a.key}`} label={c[`attack:${a.key}`].label} dice={c[`attack:${a.key}`].dice} className="chip">
                      Angriff {signed(a.toHit)}
                    </RollButton>
                    {c[`damage:${a.key}`] ? (
                      <RollButton check={`damage:${a.key}`} label={c[`damage:${a.key}`].label} dice={c[`damage:${a.key}`].dice} className="chip">
                        {a.damage} {a.damageType}
                      </RollButton>
                    ) : (
                      <span className="chip" aria-disabled>
                        {a.damage} {a.damageType}
                      </span>
                    )}
                  </div>
                  {a.notes.length > 0 && <p className="hint mt-1 text-xs">{a.notes.join(" · ")}</p>}
                </li>
              ))}
            </ul>
          </Card>

          {sheet.spellGroups.map((g) => (
            <Card key={g.source} title={`Zauber: ${g.source}`}>
              <p className="hint">
                {ABILITY_SHORT[g.ability]} · Zauber-SG {g.saveDc} · Zauberangriff {signed(g.attackBonus)}
                {g.slots ? ` · ${g.slots} Zauberplätze 1. Grad` : ""}
              </p>
              {g.note && <p className="hint mt-1">{g.note}</p>}
              {[
                ["Zaubertricks", g.cantrips],
                ["Vorbereitet (1. Grad)", g.spells],
              ].map(([title, list]) =>
                (list as typeof g.spells).length > 0 ? (
                  <div key={title as string} className="mt-3">
                    <p className="eyebrow mb-1">{title as string}</p>
                    <ul className="space-y-2">
                      {(list as typeof g.spells).map((sp) => (
                        <li key={sp.id} className="rounded-lg border border-line p-2">
                          <details>
                            <summary className="flex cursor-pointer flex-wrap items-center gap-2">
                              <span className="flex-1 font-semibold">{sp.name}</span>
                              {sp.concentration && <span className="badge">K</span>}
                              {sp.ritual && <span className="badge">R</span>}
                            </summary>
                            <p className="hint mt-1 text-xs">
                              {sp.castingTime} · {sp.range} · {sp.duration}
                            </p>
                            <p className="mt-1 text-sm">{sp.summary}</p>
                          </details>
                          {(sp.checks.attack || sp.checks.damage || sp.checks.healing || sp.save) && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {sp.save && <span className="hint text-xs">RW {ABILITY_SHORT[sp.save]} gegen SG {g.saveDc}</span>}
                              {sp.checks.attack && (
                                <RollButton check={sp.checks.attack} label={c[sp.checks.attack].label} dice={c[sp.checks.attack].dice} className="chip">
                                  Angriff {signed(g.attackBonus)}
                                </RollButton>
                              )}
                              {sp.checks.damage && (
                                <RollButton check={sp.checks.damage} label={c[sp.checks.damage].label} dice={c[sp.checks.damage].dice} className="chip">
                                  {c[sp.checks.damage].dice} {sp.damageType}
                                </RollButton>
                              )}
                              {sp.checks.healing && (
                                <RollButton check={sp.checks.healing} label={c[sp.checks.healing].label} dice={c[sp.checks.healing].dice} className="chip">
                                  Heilung {c[sp.checks.healing].dice}
                                </RollButton>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null,
              )}
            </Card>
          ))}
        </div>
      </div>

      <Card title="Merkmale und Talente">
        <ul className="space-y-3">
          {sheet.features.map((f, i) => (
            <li key={`${f.name}-${i}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{f.name}</span>
                <span className="badge">{f.source}</span>
                {f.check && c[f.check] && (
                  <RollButton check={f.check} label={c[f.check].label} dice={c[f.check].dice} className="chip ml-auto">
                    {c[f.check].dice}
                  </RollButton>
                )}
              </div>
              <p className="mt-1 text-sm text-muted">{f.summary}</p>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Übung und Sprachen">
          <dl className="grid gap-2 text-sm sm:grid-cols-[8rem_1fr]">
            <dt className="hint">Rüstungen</dt>
            <dd>{sheet.proficiencies.armor.join(", ") || "keine"}</dd>
            <dt className="hint">Waffen</dt>
            <dd>{sheet.proficiencies.weapons.join(", ")}</dd>
            <dt className="hint">Werkzeuge</dt>
            <dd>{sheet.proficiencies.tools.join(", ") || "keine"}</dd>
            <dt className="hint">Sprachen</dt>
            <dd>{sheet.proficiencies.languages.join(", ")}</dd>
            {sheet.resistances.length > 0 && (
              <>
                <dt className="hint">Resistenzen</dt>
                <dd>{sheet.resistances.join(", ")}</dd>
              </>
            )}
            {sheet.darkvision && (
              <>
                <dt className="hint">Sinne</dt>
                <dd>Dunkelsicht {m(sheet.darkvision)} m</dd>
              </>
            )}
            <dt className="hint">Größe</dt>
            <dd>{sheet.size}</dd>
          </dl>
        </Card>
        <Card title="Ausrüstung">
          <ul className="list-disc space-y-0.5 pl-5 text-sm">
            {sheet.equipment.map((it, i) => (
              <li key={i}>{(it.qty ?? 1) > 1 ? `${it.qty} × ${it.name}` : it.name}</li>
            ))}
          </ul>
          <p className="mt-2 font-semibold">{sheet.gold} Goldmünzen</p>
        </Card>
      </div>
    </div>
  );
}
