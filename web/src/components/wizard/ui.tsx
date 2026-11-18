"use client";

import type { ReactNode } from "react";
import { SPELL_BY_ID } from "@/rules/spells";

export function Section({ title, hint, children }: { title: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="font-serif text-lg">{title}</h3>
      {hint && <p className="hint mb-2">{hint}</p>}
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function ChoiceGrid<T extends { id: string }>({
  items,
  selected,
  onSelect,
  render,
  columns = "sm:grid-cols-2",
}: {
  items: T[];
  selected: string | undefined;
  onSelect: (id: string) => void;
  render: (item: T) => ReactNode;
  columns?: string;
}) {
  return (
    <div className={`grid gap-2 ${columns}`}>
      {items.map((it) => (
        <button key={it.id} type="button" className="choice" aria-pressed={selected === it.id} onClick={() => onSelect(it.id)}>
          {render(it)}
        </button>
      ))}
    </div>
  );
}

// Mehrfachauswahl als Chips, begrenzt auf `max`. `blocked` = schon aus anderer Quelle vorhanden.
export function ChipPicker<T extends string>({
  options,
  selected,
  max,
  onChange,
  blocked = {},
}: {
  options: { id: T; label: ReactNode }[];
  selected: T[];
  max: number;
  onChange: (next: T[]) => void;
  blocked?: Partial<Record<T, string>>;
}) {
  const full = selected.length >= max;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = selected.includes(o.id);
          const reason = blocked[o.id];
          return (
            <button
              key={o.id}
              type="button"
              className="chip"
              aria-pressed={on}
              disabled={!on && (full || Boolean(reason))}
              title={reason}
              onClick={() => onChange(on ? selected.filter((x) => x !== o.id) : max === 1 ? [o.id] : [...selected, o.id])}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <p className="hint mt-1">
        {selected.length} von {max} gewählt
      </p>
    </div>
  );
}

// Zauberauswahl als Liste mit Kurzbeschreibung (auf dem Handy besser lesbar als Chips)
export function SpellPicker({ ids, selected, max, onChange }: { ids: string[]; selected: string[]; max: number; onChange: (next: string[]) => void }) {
  const full = selected.length >= max;
  return (
    <div>
      <p className="hint mb-2">
        {selected.length} von {max} gewählt
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {ids.map((id) => {
          const sp = SPELL_BY_ID[id];
          if (!sp) return null;
          const on = selected.includes(id);
          return (
            <li key={id}>
              <button
                type="button"
                className="choice h-full"
                aria-pressed={on}
                disabled={!on && full}
                style={!on && full ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                onClick={() => onChange(on ? selected.filter((x) => x !== id) : [...selected, id])}
              >
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold">{sp.name}</span>
                  <span className="hint text-xs">
                    {sp.castingTime} · {sp.range}
                    {sp.concentration ? " · Konzentration" : ""}
                    {sp.ritual ? " · Ritual" : ""}
                  </span>
                </span>
                <span className="hint mt-1 block">{sp.summary}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Pills({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((x) => (
        <span key={x} className="badge">
          {x}
        </span>
      ))}
    </div>
  );
}
