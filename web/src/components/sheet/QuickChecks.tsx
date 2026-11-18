import { ABILITIES, signed } from "@/rules/core";
import type { Sheet } from "@/rules/sheet";
import { RollButton } from "./RollPanel";

// Kompakte Würfelleiste für die Szene: die häufigsten Würfe eines Charakters als Chips
export function QuickChecks({ sheet }: { sheet: Sheet }) {
  const c = sheet.checks;
  const chip = (key: string, text: string) =>
    c[key] ? (
      <RollButton key={key} check={key} label={c[key].label} dice={c[key].dice} className="chip">
        {text}
      </RollButton>
    ) : null;

  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="eyebrow mb-1">Kampf</p>
        <div className="flex flex-wrap gap-2">
          {chip("initiative", `Initiative ${signed(sheet.initiative)}`)}
          {sheet.attacks.map((a) => chip(`attack:${a.key}`, `${a.name} ${signed(a.toHit)}`))}
          {sheet.attacks.map((a) => chip(`damage:${a.key}`, `Schaden ${a.name}`))}
        </div>
      </div>
      <div>
        <p className="eyebrow mb-1">Attribute und Rettungswürfe</p>
        <div className="flex flex-wrap gap-2">
          {ABILITIES.map((a) => chip(`ability:${a.id}`, `${a.short} ${signed(sheet.mods[a.id])}`))}
          {sheet.saves.map((s) => chip(`save:${s.ability}`, `RW ${ABILITIES.find((a) => a.id === s.ability)!.short} ${signed(s.bonus)}`))}
        </div>
      </div>
      <div>
        <p className="eyebrow mb-1">Fertigkeiten</p>
        <div className="flex flex-wrap gap-2">{sheet.skills.map((s) => chip(`skill:${s.id}`, `${s.name} ${signed(s.bonus)}`))}</div>
      </div>
      {sheet.spellGroups.length > 0 && (
        <div>
          <p className="eyebrow mb-1">Zauber</p>
          <div className="flex flex-wrap gap-2">
            {sheet.spellGroups.flatMap((g) =>
              [...g.cantrips, ...g.spells].flatMap((sp) => [
                sp.checks.attack ? chip(sp.checks.attack, `${sp.name}: Angriff`) : null,
                sp.checks.damage ? chip(sp.checks.damage, `${sp.name}: Schaden`) : null,
                sp.checks.healing ? chip(sp.checks.healing, `${sp.name}: Heilung`) : null,
              ]),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
