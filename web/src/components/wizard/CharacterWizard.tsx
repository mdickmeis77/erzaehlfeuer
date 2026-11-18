"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { createCharacter, type CreateCharacterState } from "@/app/actions/character";
import { STEPS, emptyBuild, validateBuild, type CharacterBuild } from "@/rules/build";
import { signed, type AbilityMethod } from "@/rules/core";
import { computeSheet } from "@/rules/sheet";
import { StepAbilities, emptyAssignment, type Assignment, type RollInfo } from "./StepAbilities";
import { StepBackground } from "./StepBackground";
import { StepClass } from "./StepClass";
import { StepEquipment } from "./StepEquipment";
import { StepSpecies } from "./StepSpecies";

type Draft = { build: CharacterBuild; step: number; roll: RollInfo | null; assign: Assignment };

export function CharacterWizard({ campaignId, methods }: { campaignId: string; methods: AbilityMethod[] }) {
  const storageKey = `ef-charakter-entwurf-${campaignId}`;
  const [build, setBuild] = useState<CharacterBuild>(() => emptyBuild(methods[0] ?? "standard"));
  const [step, setStep] = useState(0);
  const [roll, setRoll] = useState<RollInfo | null>(null);
  const [assign, setAssign] = useState<Assignment>(emptyAssignment);
  const [showIssues, setShowIssues] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [state, action, pending] = useActionState<CreateCharacterState, FormData>(createCharacter.bind(null, campaignId), undefined);

  // Entwurf im Browser merken, damit nichts verloren geht (z. B. wenn das Handy die Seite neu lädt)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const d = JSON.parse(raw) as Draft;
        if (d.build && methods.includes(d.build.abilityMethod)) {
          setBuild({ ...emptyBuild(), ...d.build });
          setStep(Math.min(d.step ?? 0, STEPS.length - 1));
          setRoll(d.roll ?? null);
          setAssign(d.assign ?? emptyAssignment());
        }
      }
    } catch {
      // Ohne gespeicherten Entwurf geht es auch
    }
    setLoaded(true);
  }, [storageKey, methods]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ build, step, roll, assign } satisfies Draft));
    } catch {
      // Speicher nicht verfügbar
    }
  }, [loaded, storageKey, build, step, roll, assign]);

  const set = (patch: Partial<CharacterBuild>) => {
    setShowIssues(false);
    setBuild((b) => ({ ...b, ...patch }));
  };

  const issues = useMemo(() => validateBuild(build, { allowedMethods: methods, rolledValues: roll?.values ?? null }), [build, methods, roll]);
  const blocking = issues.filter((i) => i.step <= step);
  const complete = issues.length === 0;
  const sheet = useMemo(() => (complete ? computeSheet(build) : null), [complete, build]);

  const go = (target: number) => {
    setShowIssues(false);
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const next = () => (blocking.length > 0 ? setShowIssues(true) : go(step + 1));

  const reset = () => {
    if (!confirm("Entwurf verwerfen und von vorne beginnen?")) return;
    setBuild(emptyBuild(methods[0] ?? "standard"));
    setRoll(null);
    setAssign(emptyAssignment());
    go(0);
  };

  return (
    <div>
      <div className="progress mb-2" role="list" aria-label="Fortschritt">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            role="listitem"
            aria-label={`${i + 1}. ${label}`}
            data-state={i === step ? "current" : i < step ? "done" : "todo"}
            onClick={() => (i < step || !issues.some((x) => x.step < i) ? go(i) : setShowIssues(true))}
          />
        ))}
      </div>
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <p className="eyebrow">
          Schritt {step + 1} von {STEPS.length}: {STEPS[step]}
        </p>
        <button type="button" className="btn-quiet hint" onClick={reset}>
          Neu beginnen
        </button>
      </div>

      {step === 0 && <StepSpecies build={build} set={set} />}
      {step === 1 && <StepClass build={build} set={set} />}
      {step === 2 && <StepBackground build={build} set={set} />}
      {step === 3 && (
        <StepAbilities build={build} set={set} methods={methods} campaignId={campaignId} roll={roll} setRoll={setRoll} assign={assign} setAssign={setAssign} />
      )}
      {step === 4 && <StepEquipment build={build} set={set} />}
      {step === 5 && (
        <form action={action} className="space-y-4" onSubmit={() => setShowIssues(true)}>
          <input type="hidden" name="build" value={JSON.stringify(build)} />
          {sheet ? (
            <div className="card">
              <p className="hint">
                {sheet.speciesName} · {sheet.className} · {sheet.backgroundName} · Stufe 1
              </p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                <div className="stat"><div className="stat-label">TP</div><div className="stat-value">{sheet.hpMax}</div></div>
                <div className="stat"><div className="stat-label">RK</div><div className="stat-value">{sheet.ac}</div></div>
                <div className="stat"><div className="stat-label">Init.</div><div className="stat-value">{signed(sheet.initiative)}</div></div>
                <div className="stat"><div className="stat-label">Bew.</div><div className="stat-value">{String(sheet.speed).replace(".", ",")}</div></div>
              </div>
              <div className="mt-2 grid grid-cols-6 gap-1 text-center text-sm">
                {(["str", "dex", "con", "int", "wis", "cha"] as const).map((a) => (
                  <div key={a} className="stat !p-1">
                    <div className="stat-label">{({ str: "ST", dex: "GE", con: "KO", int: "IN", wis: "WE", cha: "CH" } as const)[a]}</div>
                    <div className="font-semibold">{sheet.scores[a]}</div>
                    <div className="hint text-xs">{signed(sheet.mods[a])}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card">
              <p className="font-semibold">Es fehlt noch etwas:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {issues.map((i, n) => (
                  <li key={n}>
                    <button type="button" className="link text-left" onClick={() => go(i.step)}>
                      {STEPS[i.step]}
                    </button>
                    : {i.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <label className="field">
            <span>Name des Charakters</span>
            <input className="input" name="name" required minLength={2} maxLength={60} placeholder="z. B. Mira Flinkfuß" />
          </label>
          <label className="field">
            <span>Aussehen (optional)</span>
            <textarea className="input" name="appearance" maxLength={2000} placeholder="Wie sieht dein Charakter aus? Was fällt anderen zuerst auf?" />
          </label>
          <label className="field">
            <span>Hintergrundgeschichte (optional)</span>
            <textarea className="input" name="backstory" maxLength={8000} placeholder="Woher kommt dein Charakter, was treibt ihn an?" />
          </label>

          {state?.error && (
            <div className="error" role="alert">
              <p>{state.error}</p>
              {state.issues && (
                <ul className="list-disc pl-5">
                  {state.issues.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-2">
            <button type="button" className="btn" onClick={() => go(step - 1)}>
              Zurück
            </button>
            <button className="btn btn-primary" disabled={!complete || pending}>
              {pending ? "Speichere …" : "Charakter erstellen"}
            </button>
          </div>
        </form>
      )}

      {step < 5 && (
        <div className="mt-8">
          {showIssues && blocking.length > 0 && (
            <ul className="error mb-3 list-disc space-y-1 pl-5" role="alert">
              {blocking.map((i, n) => (
                <li key={n}>
                  {i.step < step ? `${STEPS[i.step]}: ` : ""}
                  {i.message}
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-between gap-2">
            <button type="button" className="btn" onClick={() => go(step - 1)} disabled={step === 0}>
              Zurück
            </button>
            <button type="button" className="btn btn-primary" onClick={next}>
              Weiter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
