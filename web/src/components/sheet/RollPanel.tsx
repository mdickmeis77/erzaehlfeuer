"use client";

import { createContext, useActionState, useContext, useEffect, useState, type ReactNode } from "react";
import { rollCharacterCheck, type CheckRollState } from "@/app/actions/character";

type Pending = { key: string; label: string; dice: string };
const Ctx = createContext<(p: Pending) => void>(() => {});

type SceneOption = { id: string; title: string };

// Umschließt einen Charakterbogen. Antippen eines Werts öffnet unten ein Feld zum Würfeln in eine Szene.
export function RollProvider({
  campaignId,
  characterId,
  characterName,
  scenes,
  fixedSceneId,
  isGm,
  children,
}: {
  campaignId: string;
  characterId: string;
  characterName: string;
  scenes: SceneOption[];
  fixedSceneId?: string;
  isGm: boolean;
  children: ReactNode;
}) {
  const [current, setCurrent] = useState<Pending | null>(null);
  const [state, action, pending] = useActionState<CheckRollState, FormData>(rollCharacterCheck.bind(null, campaignId, characterId), undefined);
  const storageKey = `ef-szene-${campaignId}`;
  const [sceneId, setSceneId] = useState(fixedSceneId ?? scenes[0]?.id ?? "");

  useEffect(() => {
    if (fixedSceneId) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && scenes.some((s) => s.id === saved)) setSceneId(saved);
    } catch {
      // egal
    }
  }, [fixedSceneId, scenes, storageKey]);

  // Nach dem Würfeln das Feld schließen; das Ergebnis bleibt kurz sichtbar
  const [lastResult, setLastResult] = useState<{ label: string; total: number } | null>(null);
  useEffect(() => {
    if (!state?.sentAt || state.total === undefined) return;
    setLastResult({ label: state.label ?? "", total: state.total });
    setCurrent(null);
    const t = setTimeout(() => setLastResult(null), 6000);
    return () => clearTimeout(t);
  }, [state?.sentAt, state?.total, state?.label]);

  const isD20 = current?.dice.startsWith("1W20");

  return (
    <Ctx.Provider value={setCurrent}>
      {children}

      {lastResult && !current && (
        <div className="roll-panel" role="status">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <span>
              {characterName}: {lastResult.label}
            </span>
            <strong className="text-2xl text-ember">{lastResult.total}</strong>
          </div>
        </div>
      )}

      {current && (
        <div className="roll-panel" role="dialog" aria-label={`Würfeln: ${current.label}`}>
          <form action={action} className="mx-auto max-w-3xl space-y-3">
            <input type="hidden" name="check" value={current.key} />
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="font-semibold">{current.label}</p>
                <p className="hint">{current.dice}</p>
              </div>
              <button type="button" className="btn-quiet hint" onClick={() => setCurrent(null)} aria-label="Schließen">
                ✕
              </button>
            </div>

            {isD20 && (
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Vorteil oder Nachteil">
                {[
                  ["normal", "Normal"],
                  ["advantage", "Vorteil"],
                  ["disadvantage", "Nachteil"],
                ].map(([v, l]) => (
                  <label key={v} className="check chip">
                    <input type="radio" name="mode" value={v} defaultChecked={v === "normal"} /> {l}
                  </label>
                ))}
              </div>
            )}

            {fixedSceneId ? (
              <input type="hidden" name="sceneId" value={fixedSceneId} />
            ) : scenes.length === 0 ? (
              <p className="hint">Es gibt noch keine Szene, in die du würfeln kannst.</p>
            ) : (
              <label className="field">
                <span>In Szene</span>
                <select
                  className="input"
                  name="sceneId"
                  value={sceneId}
                  onChange={(e) => {
                    setSceneId(e.target.value);
                    try {
                      localStorage.setItem(storageKey, e.target.value);
                    } catch {
                      // egal
                    }
                  }}
                >
                  {scenes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <input className="input" name="note" maxLength={500} placeholder="Kurzer Text dazu (optional)" aria-label="Text zum Wurf" />
            {isGm && (
              <label className="check">
                <input type="checkbox" name="hidden" /> Verdeckt würfeln
              </label>
            )}
            {state?.error && <p className="error">{state.error}</p>}
            <button className="btn btn-primary w-full" disabled={pending || (!fixedSceneId && scenes.length === 0)}>
              {pending ? "Würfle …" : "Würfeln"}
            </button>
          </form>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function RollButton({ check, label, dice, className = "rollable", children }: { check: string; label: string; dice: string; className?: string; children: ReactNode }) {
  const open = useContext(Ctx);
  return (
    <button type="button" className={className} onClick={() => open({ key: check, label, dice })} title={`${label}: ${dice}`}>
      {children}
    </button>
  );
}
