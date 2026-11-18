"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createPost, type PostState } from "@/app/actions/scene";

type Target = { userId: string; displayName: string };

export function Composer({
  campaignId,
  sceneId,
  isGm,
  whisperTargets,
  characters = [],
}: {
  campaignId: string;
  sceneId: string;
  isGm: boolean;
  whisperTargets: Target[];
  characters?: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<PostState, FormData>(createPost.bind(null, campaignId, sceneId), undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const [showOptions, setShowOptions] = useState(false);

  // Nach erfolgreichem Senden Text und Wurf leeren, Optionen behalten
  useEffect(() => {
    if (!state?.sentAt || !formRef.current) return;
    const f = formRef.current;
    (f.elements.namedItem("body") as HTMLTextAreaElement).value = "";
    (f.elements.namedItem("dice") as HTMLInputElement).value = "";
  }, [state?.sentAt]);

  return (
    <form ref={formRef} action={action} className="card space-y-3">
      <textarea
        className="input"
        name="body"
        maxLength={8000}
        placeholder={isGm ? "Beschreibe, was passiert …" : "Was tut dein Charakter?"}
        aria-label="Text"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) formRef.current?.requestSubmit();
        }}
      />
      {characters.length > 0 && (
        <label className="field">
          <span>Sprechen als</span>
          <select className="input" name="characterId" defaultValue={isGm ? "" : characters[0].id}>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value="">{isGm ? "Spielleitung / mich selbst" : "mich selbst (außerhalb des Spiels)"}</option>
          </select>
        </label>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input className="input w-40 flex-none" name="dice" placeholder="Wurf, z. B. W20+5" aria-label="Würfelwurf" autoComplete="off" />
        <button type="button" className="btn btn-quiet" onClick={() => setShowOptions((v) => !v)} aria-expanded={showOptions}>
          {showOptions ? "Optionen ausblenden" : "Optionen"}
        </button>
        <button className="btn btn-primary ml-auto" disabled={pending}>
          {pending ? "Sende …" : "Senden"}
        </button>
      </div>

      <div className={showOptions ? "grid gap-3 border-t border-line pt-3 sm:grid-cols-2" : "hidden"}>
        {isGm && (
          <>
            <label className="check"><input type="checkbox" name="asGm" defaultChecked /> Als Spielleitung</label>
            <label className="check"><input type="checkbox" name="rollHidden" /> Verdeckt würfeln</label>
            <label className="check"><input type="checkbox" name="gmNote" /> Nur für die Spielleitung (Notiz)</label>
            <label className="field">
              <span>Als NSC sprechen (optional)</span>
              <input className="input" name="speaker" maxLength={60} placeholder="z. B. Fischhändler Joren" />
            </label>
          </>
        )}
        <label className="field">
          <span>Flüstern an</span>
          <select className="input" name="whisperTo" defaultValue="">
            <option value="">– niemanden, für alle sichtbar –</option>
            {whisperTargets.map((t) => (
              <option key={t.userId} value={t.userId}>{t.displayName}</option>
            ))}
          </select>
        </label>
      </div>

      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <p className="hint">Strg + Enter sendet.</p>
    </form>
  );
}
