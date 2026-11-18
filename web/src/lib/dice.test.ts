import { describe, expect, it } from "vitest";
import { DiceError, describeRoll, rollDice } from "./dice";

// Würfel, der der Reihe nach feste Werte liefert
const fixed = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe("rollDice", () => {
  it("versteht deutsche und englische Schreibweise", () => {
    expect(rollDice("W20+5", fixed(12)).total).toBe(17);
    expect(rollDice("1d20 + 5", fixed(12)).total).toBe(17);
  });

  it("normalisiert den Ausdruck", () => {
    expect(rollDice("w20", fixed(3)).expression).toBe("1W20");
    expect(rollDice("2d6 - 1", fixed(3, 4)).expression).toBe("2W6-1");
  });

  it("rechnet mehrere Würfel und Modifikatoren zusammen", () => {
    const r = rollDice("2W6+1W4+2", fixed(3, 5, 2));
    expect(r.terms.map((t) => t.rolls)).toEqual([[3, 5], [2]]);
    expect(r.total).toBe(12);
  });

  it("zieht negative Würfel ab", () => {
    expect(rollDice("W20-W4", fixed(10, 3)).total).toBe(7);
  });

  it("lehnt ungültige Eingaben ab", () => {
    for (const bad of ["", "abc", "5", "W1", "W1001", "101W6", "W20+x", "W20*2"]) {
      expect(() => rollDice(bad), bad).toThrow(DiceError);
    }
  });

  it("bleibt mit echtem Zufall im gültigen Bereich", () => {
    for (let i = 0; i < 200; i++) {
      const r = rollDice("W20");
      expect(r.total).toBeGreaterThanOrEqual(1);
      expect(r.total).toBeLessThanOrEqual(20);
    }
  });
});

describe("describeRoll", () => {
  it("zeigt die Einzelwürfe", () => {
    expect(describeRoll(rollDice("W20+5", fixed(12)))).toBe("W20: 12 + 5");
    expect(describeRoll(rollDice("2W6-1", fixed(3, 4)))).toBe("2W6: (3 + 4) − 1");
  });
});
