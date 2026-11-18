"use client";

import { useState, useTransition } from "react";
import { rollAbilityScores } from "@/app/actions/character";
import { BACKGROUND_BY_ID } from "@/rules/backgrounds";
import { CLASS_BY_ID } from "@/rules/classes";
import {
  ABILITIES,
  ABILITY_METHODS,
  POINT_BUY_BUDGET,
  POINT_BUY_COST,
  STANDARD_ARRAY,
  abilityMod,
  pointBuyTotal,
  signed,
  type AbilityMethod,
} from "@/rules/core";
import type { AbilityId } from "@/rules/types";
import type { StepProps } from "./shared";
import { Section } from "./ui";

export type RollInfo = { rollId: string; values: number[]; details: number[][]; attempt: number };
export type Assignment = Record<AbilityId, number>; // Index im Wertepool, −1 = nicht vergeben

export const emptyAssignment = (): Assignment => ({ str: -1, dex: -1, con: -1, int: -1, wis: -1, cha: -1 });

export function StepAbilities({
  build,
  set,
  methods,
  campaignId,
  roll,
  setRoll,
  assign,
  setAssign,
}: StepProps & {
  methods: AbilityMethod[];
  campaignId: string;
  roll: RollInfo | null;
  setRoll: (r: RollInfo | null) => void;
  assign: Assignment;
  setAssign: (a: Assignment) => void;
}) {
  const bg = BACKGROUND_BY_ID[build.background];
  const cls = build.class ? CLASS_BY_ID[build.class] : undefined;
  const [rollError, setRollError] = useState<string | null>(null);
  const [rolling, startRolling] = useTransition();

  const pool = build.abilityMethod === "roll" ? (roll?.values ?? []) : STANDARD_ARRAY;

  const switchMethod = (m: AbilityMethod) => {
    if (m === build.abilityMethod) return;
    setAssign(emptyAssignment());
    const base = m === "pointbuy" ? 8 : 0;
    set({ abilityMethod: m, baseScores: { str: base, dex: base, con: base, int: base, wis: base, cha: base }, rollId: m === "roll" ? roll?.rollId : undefined });
  };

  const assignValue = (ability: AbilityId, index: number) => {
    const next = { ...assign };
    // Ein Wert kann nur einem Attribut gehören: vorherigen Besitzer freigeben
    for (const a of Object.keys(next) as AbilityId[]) if (next[a] === index && index !== -1) next[a] = -1;
    next[ability] = index;
    setAssign(next);
    const baseScores = { ...build.baseScores };
    for (const a of Object.keys(next) as AbilityId[]) baseScores[a] = next[a] >= 0 ? pool[next[a]] : 0;
    set({ baseScores });
  };

  const doRoll = () =>
    startRolling(async () => {
      setRollError(null);
      const r = await rollAbilityScores(campaignId);
      if ("error" in r) {
        setRollError(r.error);
        return;
      }
      setRoll(r);
      setAssign(emptyAssignment());
      set({ rollId: r.rollId, baseScores: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 } });
    });

  const spent = build.abilityMethod === "pointbuy" ? pointBuyTotal(ABILITIES.map((a) => build.baseScores[a.id])) : null;

  const bonus = (a: AbilityId) => build.backgroundBonus[a] ?? 0;
  const setBonus = (a: AbilityId, v: number) => set({ backgroundBonus: { ...build.backgroundBonus, [a]: v } });

  return (
    <div>
      <p className="hint mb-3">
        Sechs Attribute beschreiben deinen Charakter.
        {cls && <> Für {cls.name} ist {cls.primary.map((a) => ABILITIES.find((x) => x.id === a)!.name).join(" oder ")} am wichtigsten.</>}
      </p>

      {methods.length > 1 && (
        <div className="grid gap-2 sm:grid-cols-3">
          {ABILITY_METHODS.filter((m) => methods.includes(m.id)).map((m) => (
            <button key={m.id} type="button" className="choice" aria-pressed={build.abilityMethod === m.id} onClick={() => switchMethod(m.id)}>
              <span className="font-semibold">{m.name}</span>
              <span className="hint mt-1 block">{m.description}</span>
            </button>
          ))}
        </div>
      )}
      {methods.length === 1 && <p className="hint">Die Spielleitung hat festgelegt: {ABILITY_METHODS.find((m) => m.id === methods[0])?.name}.</p>}

      {build.abilityMethod === "roll" && (
        <Section title="Würfeln" hint="Gewürfelt wird auf dem Server. Die Spielleitung sieht, wie oft du gewürfelt hast.">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-primary" onClick={doRoll} disabled={rolling}>
              {rolling ? "Würfle …" : roll ? "Neu würfeln" : "6 × 4W6 würfeln"}
            </button>
            {roll && <span className="hint">Versuch {roll.attempt}</span>}
          </div>
          {rollError && <p className="error mt-2">{rollError}</p>}
          {roll && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {roll.details.map((d, i) => {
                const lowest = d.indexOf(Math.min(...d));
                return (
                  <li key={i} className="stat min-w-20">
                    <div className="stat-value">{roll.values[i]}</div>
                    <div className="hint text-xs">
                      {d.map((v, j) => (
                        <span key={j} className={j === lowest ? "line-through opacity-50" : ""}>
                          {v}
                          {j < 3 ? " " : ""}
                        </span>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      )}

      {build.abilityMethod === "pointbuy" && (
        <p className={`mt-4 font-semibold ${spent !== null && spent > POINT_BUY_BUDGET ? "error" : ""}`}>
          {POINT_BUY_BUDGET - (spent ?? 0)} von {POINT_BUY_BUDGET} Punkten übrig
        </p>
      )}

      <Section title="Verteilen">
        <div className="space-y-2">
          {ABILITIES.map((a) => {
            const base = build.baseScores[a.id];
            const total = base + bonus(a.id);
            const primary = cls?.primary.includes(a.id);
            return (
              <div key={a.id} className="card flex flex-wrap items-end gap-x-3 gap-y-2 !p-3">
                <div className="w-full sm:w-auto sm:min-w-40 sm:flex-1 sm:self-center">
                  <span className="font-semibold">{a.name}</span>
                  {primary && <span className="badge badge-ember ml-2">wichtig</span>}
                </div>

                <div className="field !gap-1">
                  <span className="text-xs">Wert</span>
                {build.abilityMethod === "pointbuy" ? (
                  <div className="flex items-center gap-2">
                    <button type="button" className="btn !px-3 !py-1" disabled={base <= 8} onClick={() => set({ baseScores: { ...build.baseScores, [a.id]: base - 1 } })} aria-label={`${a.name} senken`}>
                      −
                    </button>
                    <span className="w-8 text-center text-lg font-semibold">{base}</span>
                    <button type="button" className="btn !px-3 !py-1" disabled={base >= 15} onClick={() => set({ baseScores: { ...build.baseScores, [a.id]: base + 1 } })} aria-label={`${a.name} erhöhen`}>
                      +
                    </button>
                    <span className="hint w-16 text-xs">{POINT_BUY_COST[base] ?? "?"} Pkt.</span>
                  </div>
                ) : (
                  <select
                    className="input !w-24"
                    value={assign[a.id]}
                    onChange={(e) => assignValue(a.id, Number(e.target.value))}
                    disabled={build.abilityMethod === "roll" && !roll}
                    aria-label={`Wert für ${a.name}`}
                  >
                    <option value={-1}>–</option>
                    {pool.map((v, i) => {
                      const owner = (Object.keys(assign) as AbilityId[]).find((x) => assign[x] === i);
                      return (
                        <option key={i} value={i}>
                          {v}
                          {owner && owner !== a.id ? ` (${ABILITIES.find((x) => x.id === owner)!.short})` : ""}
                        </option>
                      );
                    })}
                  </select>
                )}
                </div>

                {bg?.abilities.includes(a.id) && (
                  <div className="field !gap-1">
                    <span className="text-xs">Hintergrund</span>
                    <select className="input !w-20" value={bonus(a.id)} onChange={(e) => setBonus(a.id, Number(e.target.value))} aria-label={`Bonus des Hintergrunds auf ${a.name}`}>
                      <option value={0}>+0</option>
                      <option value={1}>+1</option>
                      <option value={2}>+2</option>
                    </select>
                  </div>
                )}

                <div className="ml-auto w-20 self-center text-right">
                  {base > 0 ? (
                    <>
                      <span className="text-lg font-semibold">{total}</span> <span className="hint">({signed(abilityMod(total))})</span>
                    </>
                  ) : (
                    <span className="hint">–</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {bg && (
          <p className="hint mt-3">
            Hintergrund {bg.name}: Verteile +2 und +1 oder dreimal +1 auf {bg.abilities.map((a) => ABILITIES.find((x) => x.id === a)!.name).join(", ")}.
          </p>
        )}
        {!bg && <p className="hint mt-3">Wähle einen Hintergrund, um seine Attributsboni zu verteilen.</p>}
      </Section>
    </div>
  );
}
