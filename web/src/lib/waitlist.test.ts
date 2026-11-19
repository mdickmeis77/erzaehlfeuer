import { describe, expect, it } from "vitest";
import { isAdminEmail, normalizeEmail, parseRole } from "./waitlist";

describe("Warteliste", () => {
  it("normalisiert gültige Adressen", () => {
    expect(normalizeEmail("  Mira@Example.DE ")).toBe("mira@example.de");
  });

  it("lehnt ungültige Adressen ab", () => {
    for (const bad of ["", "mira", "mira@", "@example.de", "mira@example", "mi ra@example.de", "a@b@c.de"]) {
      expect(normalizeEmail(bad)).toBeNull();
    }
  });

  it("akzeptiert nur bekannte Rollen", () => {
    expect(parseRole("gm")).toBe("gm");
    expect(parseRole("admin")).toBeNull();
  });

  it("erkennt Admins aus der Umgebungsvariable", () => {
    expect(isAdminEmail("SL@test.local", "sl@test.local, andere@test.local")).toBe(true);
    expect(isAdminEmail("mira@test.local", "sl@test.local")).toBe(false);
    expect(isAdminEmail("sl@test.local", "")).toBe(false);
  });
});
