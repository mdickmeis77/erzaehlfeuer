import { randomInt } from "node:crypto";

// Würfelausdrücke wie "W20+5", "1d20 + 3", "2W6-1" oder "2d6+1d4+2".
// Gewürfelt wird immer auf dem Server, damit niemand Ergebnisse fälschen kann.

export type DiceTerm = {
  sign: 1 | -1;
  count: number;
  sides: number;
  rolls: number[];
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
  if (!/^[+-]?[0-9dw+-]+$/.test(cleaned)) {
    throw new DiceError("Erlaubt sind nur Würfel wie W20 oder 2W6 und Zahlen, verbunden mit + oder −.");
  }

  const tokens = cleaned.match(/[+-]?[^+-]+/g) ?? [];
  if (tokens.length > MAX_TERMS) throw new DiceError(`Höchstens ${MAX_TERMS} Teile pro Wurf.`);

  const terms: DiceTerm[] = [];
  let modifier = 0;

  for (const token of tokens) {
    const sign: 1 | -1 = token.startsWith("-") ? -1 : 1;
    const body = token.replace(/^[+-]/, "");
    const dice = /^(\d*)[dw](\d+)$/.exec(body);
    if (dice) {
      const count = dice[1] === "" ? 1 : Number(dice[1]);
      const sides = Number(dice[2]);
      if (count < 1 || count > MAX_DICE) throw new DiceError(`Anzahl der Würfel muss zwischen 1 und ${MAX_DICE} liegen.`);
      if (sides < 2 || sides > MAX_SIDES) throw new DiceError(`Ein Würfel braucht 2 bis ${MAX_SIDES} Seiten.`);
      const rolls = Array.from({ length: count }, () => rng(1, sides));
      terms.push({ sign, count, sides, rolls });
    } else if (/^\d+$/.test(body)) {
      modifier += sign * Number(body);
    } else {
      throw new DiceError(`"${token}" ist kein gültiger Teil eines Wurfs.`);
    }
  }

  if (terms.length === 0) throw new DiceError("Mindestens ein Würfel wie W20 wird benötigt.");

  const total =
    terms.reduce((sum, t) => sum + t.sign * t.rolls.reduce((a, b) => a + b, 0), 0) + modifier;

  return { expression: formatExpression(terms, modifier), terms, modifier, total };
}

function formatExpression(terms: DiceTerm[], modifier: number): string {
  const parts = terms.map((t, i) => {
    const s = `${t.count}W${t.sides}`;
    if (i === 0) return t.sign === -1 ? `-${s}` : s;
    return `${t.sign === -1 ? "-" : "+"}${s}`;
  });
  if (modifier > 0) parts.push(`+${modifier}`);
  if (modifier < 0) parts.push(`${modifier}`);
  return parts.join("");
}

// Lesbare Aufschlüsselung, z. B. "W20: 12 + 5"
export function describeRoll(roll: RollResult): string {
  const dice = roll.terms
    .map((t, i) => {
      const values = t.rolls.join(" + ");
      const label = `${t.count > 1 ? t.count : ""}W${t.sides}: ${t.count > 1 ? `(${values})` : values}`;
      if (i === 0) return t.sign === -1 ? `− ${label}` : label;
      return `${t.sign === -1 ? "−" : "+"} ${label}`;
    })
    .join(" ");
  if (roll.modifier === 0) return dice;
  return `${dice} ${roll.modifier > 0 ? "+" : "−"} ${Math.abs(roll.modifier)}`;
}
