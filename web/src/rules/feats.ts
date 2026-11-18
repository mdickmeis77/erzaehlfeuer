// Talente nach SRD 5.2 (nur die für Stufe 1 benötigten)

export type Feat = { id: string; name: string; category: "origin" | "fightingStyle"; summary: string };

export const FEATS: Feat[] = [
  { id: "alert", name: "Wachsam", category: "origin", summary: "Du addierst deinen Übungsbonus zur Initiative. Direkt nach dem Initiativewurf darfst du deine Initiative mit einem willigen Verbündeten tauschen." },
  { id: "magic-initiate", name: "Magie-Eingeweihter", category: "origin", summary: "Du lernst zwei Zaubertricks und einen Zauber des 1. Grades aus einer Zauberliste. Den Zauber kannst du einmal pro langer Rast ohne Zauberplatz wirken." },
  { id: "savage-attacker", name: "Wilder Angreifer", category: "origin", summary: "Einmal pro Zug darfst du die Schadenswürfel eines Waffentreffers zweimal würfeln und das bessere Ergebnis nehmen." },
  { id: "skilled", name: "Vielseitig begabt", category: "origin", summary: "Du wirst in drei Fertigkeiten deiner Wahl geübt." },
  { id: "archery", name: "Kampfstil: Bogenschießen", category: "fightingStyle", summary: "+2 auf Angriffswürfe mit Fernkampfwaffen." },
  { id: "defense", name: "Kampfstil: Verteidigung", category: "fightingStyle", summary: "+1 auf die Rüstungsklasse, solange du eine leichte, mittelschwere oder schwere Rüstung trägst." },
  { id: "great-weapon-fighting", name: "Kampfstil: Kampf mit Großwaffen", category: "fightingStyle", summary: "Mit zweihändig geführten Nahkampfwaffen zählen Schadenswürfe von 1 oder 2 als 3." },
  { id: "two-weapon-fighting", name: "Kampfstil: Kampf mit zwei Waffen", category: "fightingStyle", summary: "Beim Zusatzangriff mit einer leichten Waffe addierst du deinen Attributsmodifikator zum Schaden." },
];
export const FEAT_BY_ID: Record<string, Feat> = Object.fromEntries(FEATS.map((f) => [f.id, f]));
export const ORIGIN_FEATS = FEATS.filter((f) => f.category === "origin");
export const FIGHTING_STYLES = FEATS.filter((f) => f.category === "fightingStyle");

export const SKILLED_COUNT = 3;
