import { randomInt } from "node:crypto";

// Würfelausdrücke wie "W20+5", "1d20 + 3", "2W6-1" oder "2d6+1d4+2".
// "2W20h1" behält den höchsten Würfel (Vorteil), "2W20l1" den niedrigsten (Nachteil); "kh1"/"kl1" geht auch.
// Gewürfelt wird immer auf dem Server, damit niemand Ergebnisse fälschen kann.

export type DiceTerm = {
  sign: 1 | -1;
  count: number;
  sides: number;
  rolls: number[];
  keep?: { mode: "high" | "low"; count: number };
  kept?: number[]; // Indizes der zählenden Würfel, nur wenn keep gesetzt ist
};

export type RollResult = {
  expression: string; // normalisiert, z. B. "1W20+5"
  terms: DiceTerm[];
  modifier: number;
  total: number;
};

export class DiceError extends Error {}

const MAX_DICE = 100;
const MAX_SIDES = 1000;
const MAX_TERMS = 10;

type Rng = (minInclusive: number, maxInclusive: number) => number;
const cryptoRng: Rng = (min, max) => randomInt(min, max + 1);

export function rollDice(input: string, rng: Rng = cryptoRng): RollResult {
  const cleaned = input.replace(/\s+/g, "").toLowerCase();
  if (!cleaned) throw new DiceError("Kein Würfelausdruck angegeben.");
  if (!/^[+-]?[0-9dwkhl+-]+$/.test(cleaned)) {
    throw new DiceError("Erlaubt sind nur Würfel wie W20 oder 2W6 und Zahlen, verbunden mit + oder −.");
  }

  const tokens = cleaned.match(/[+-]?[^+-]+/g) ?? [];
  if (tokens.length > MAX_TERMS) throw new DiceError(`Höchstens ${MAX_TERMS} Teile pro Wurf.`);

  const terms: DiceTerm[] = [];
  let modifier = 0;

  for (const token of tokens) {
    const sign: 1 | -1 = token.startsWith("-") ? -1 : 1;
    const body = token.replace(/^[+-]/, "");
    const dice = /^(\d*)[dw](\d+)(?:k?([hl])(\d+))?$/.exec(body);
    if (dice) {
      const count = dice[1] === "" ? 1 : Number(dice[1]);
      const sides = Number(dice[2]);
      if (count < 1 || count > MAX_DICE) throw new DiceError(`Anzahl der Würfel muss zwischen 1 und ${MAX_DICE} liegen.`);
      if (sides < 2 || sides > MAX_SIDES) throw new DiceError(`Ein Würfel braucht 2 bis ${MAX_SIDES} Seiten.`);
      const rolls = Array.from({ length: count }, () => rng(1, sides));
      const term: DiceTerm = { sign, count, sides, rolls };
      if (dice[3]) {
        const keepCount = Number(dice[4]);
        if (keepCount < 1 || keepCount >= count) throw new DiceError("Behalte mindestens einen und weniger Würfel, als du wirfst.");
        const mode = dice[3] === "h" ? "high" : "low";
        const order = rolls.map((v, i) => ({ v, i })).sort((a, b) => (mode === "high" ? b.v - a.v : a.v - b.v));
        term.keep = { mode, count: keepCount };
        term.kept = order
          .slice(0, keepCount)
          .map((x) => x.i)
          .sort((a, b) => a - b);
      }
      terms.push(term);
    } else if (/^\d+$/.test(body)) {
      modifier += sign * Number(body);
    } else {
      throw new DiceError(`"${token}" ist kein gültiger Teil eines Wurfs.`);
    }
  }

  if (terms.length === 0) throw new DiceError("Mindestens ein Würfel wie W20 wird benötigt.");

  const total = terms.reduce((sum, t) => sum + t.sign * termValue(t), 0) + modifier;

  return { expression: formatExpression(terms, modifier), terms, modifier, total };
}

export function termValue(t: DiceTerm): number {
  const counted = t.kept ? t.kept.map((i) => t.rolls[i]) : t.rolls;
  return counted.reduce((a, b) => a + b, 0);
}

function formatExpression(terms: DiceTerm[], modifier: number): string {
  const parts = terms.map((t, i) => {
    const s = `${t.count}W${t.sides}${t.keep ? `${t.keep.mode === "high" ? "h" : "l"}${t.keep.count}` : ""}`;
    if (i === 0) return t.sign === -1 ? `-${s}` : s;
    return `${t.sign === -1 ? "-" : "+"}${s}`;
  });
  if (modifier > 0) parts.push(`+${modifier}`);
  if (modifier < 0) parts.push(`${modifier}`);
  return parts.join("");
}

// Lesbare Aufschlüsselung, z. B. "W20: 12 + 5" oder "2W20 Vorteil: (17, 4 → 17) + 5"
export function describeRoll(roll: RollResult): string {
  const dice = roll.terms
    .map((t, i) => {
      let label: string;
      if (t.keep) {
        const advantage = t.count === 2 && t.keep.count === 1;
        const mode = advantage
          ? t.keep.mode === "high" ? "Vorteil" : "Nachteil"
          : `${t.keep.mode === "high" ? "höchste" : "niedrigste"} ${t.keep.count}`;
        label = `${t.count}W${t.sides} ${mode}: (${t.rolls.join(", ")} → ${termValue(t)})`;
      } else {
        const values = t.rolls.join(" + ");
        label = `${t.count > 1 ? t.count : ""}W${t.sides}: ${t.count > 1 ? `(${values})` : values}`;
      }
      if (i === 0) return t.sign === -1 ? `− ${label}` : label;
      return `${t.sign === -1 ? "−" : "+"} ${label}`;
    })
    .join(" ");
  if (roll.modifier === 0) return dice;
  return `${dice} ${roll.modifier > 0 ? "+" : "−"} ${Math.abs(roll.modifier)}`;
}

// Macht aus "1W20+5" einen Wurf mit Vorteil ("2W20h1+5") oder Nachteil ("2W20l1+5")
export function withAdvantage(expression: string, mode: "advantage" | "disadvantage" | "normal"): string {
  if (mode === "normal") return expression;
  return expression.replace(/^1?W20/i, mode === "advantage" ? "2W20h1" : "2W20l1");
}
