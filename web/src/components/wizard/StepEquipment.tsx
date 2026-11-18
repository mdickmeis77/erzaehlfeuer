"use client";

import { BACKGROUND_BY_ID } from "@/rules/backgrounds";
import { CLASS_BY_ID } from "@/rules/classes";
import type { EquipmentOption } from "@/rules/equipment";
import type { StepProps } from "./shared";
import { Section } from "./ui";

function Options({ options, selected, onSelect }: { options: EquipmentOption[]; selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => (
        <button key={o.id} type="button" className="choice" aria-pressed={selected === o.id} onClick={() => onSelect(o.id)}>
          <span className="font-semibold">{o.label}</span>
          {o.items.length > 0 && (
            <ul className="hint mt-1 list-disc pl-5">
              {o.items.map((it, i) => (
                <li key={i}>{(it.qty ?? 1) > 1 ? `${it.qty} × ${it.name}` : it.name}</li>
              ))}
            </ul>
          )}
          <span className="mt-1 block text-sm">{o.gold} GM</span>
        </button>
      ))}
    </div>
  );
}

export function StepEquipment({ build, set }: StepProps) {
  const cls = build.class ? CLASS_BY_ID[build.class] : undefined;
  const bg = BACKGROUND_BY_ID[build.background];
  return (
    <div>
      <p className="hint mb-3">Nimm ein fertiges Ausrüstungspaket oder Gold, um selbst einzukaufen (das Einkaufen sprichst du mit der Spielleitung ab).</p>
      {cls ? (
        <Section title={`Klasse: ${cls.name}`}>
          <Options options={cls.equipment} selected={build.classEquipment} onSelect={(classEquipment) => set({ classEquipment })} />
        </Section>
      ) : (
        <p className="hint">Wähle zuerst eine Klasse.</p>
      )}
      {bg ? (
        <Section title={`Hintergrund: ${bg.name}`}>
          <Options options={bg.equipment} selected={build.backgroundEquipment} onSelect={(backgroundEquipment) => set({ backgroundEquipment })} />
        </Section>
      ) : (
        <p className="hint mt-4">Wähle zuerst einen Hintergrund.</p>
      )}
    </div>
  );
}
