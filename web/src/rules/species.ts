import type { SkillId } from "./types";

// Spezies nach SRD 5.2. Entfernungen in Metern.

export type Trait = { name: string; summary: string };

export type SpeciesOption = {
  id: string;
  name: string;
  summary: string;
  speed?: number; // überschreibt die Bewegungsrate
  darkvision?: number; // überschreibt die Dunkelsicht
  resistance?: string; // Schadensart
  cantrips?: string[]; // Zauber-IDs, sofern in der Zauberliste vorhanden
};

export type Species = {
  id: string;
  name: string;
  summary: string;
  size: "medium" | "small" | "choice";
  speed: number;
  darkvision?: number;
  hpPerLevel?: number;
  resistance?: string;
  cantrips?: string[];
  traits: Trait[];
  option?: { label: string; options: SpeciesOption[] };
  // Zauber der Spezies nutzen ein frei wählbares Attribut (IN, WE oder CH)
  spellAbilityChoice?: boolean;
  skillChoice?: { count: number; from: SkillId[] | "any"; label: string };
  originFeat?: boolean;
  breathWeapon?: boolean;
};

export const SIZE_NAME = { medium: "Mittelgroß", small: "Klein" } as const;

const dragon = (id: string, name: string, type: string): SpeciesOption => ({
  id,
  name,
  summary: `Odemwaffe und Resistenz: ${type}`,
  resistance: type,
});

export const SPECIES: Species[] = [
  {
    id: "dragonborn",
    name: "Drachenblütige",
    summary: "Stolze Nachfahren von Drachen mit einer Odemwaffe und Widerstand gegen das Element ihrer Ahnen.",
    size: "medium",
    speed: 9,
    darkvision: 18,
    breathWeapon: true,
    traits: [
      { name: "Odemwaffe", summary: "Statt eines Angriffs atmest du Energie in einem Kegel (4,5 m) oder einer Linie (9 m). Geschicklichkeitsrettungswurf, sonst 1W10 Schaden (halb bei Erfolg). So oft pro langer Rast wie dein Übungsbonus." },
      { name: "Schadensresistenz", summary: "Resistenz gegen die Schadensart deiner Drachenahnen." },
      { name: "Dunkelsicht", summary: "Du siehst 18 m weit im Dunkeln wie im Dämmerlicht." },
    ],
    option: {
      label: "Drachenahnen",
      options: [
        dragon("black", "Schwarzer Drache", "Säure"),
        dragon("blue", "Blauer Drache", "Blitz"),
        dragon("brass", "Messingdrache", "Feuer"),
        dragon("bronze", "Bronzedrache", "Blitz"),
        dragon("copper", "Kupferdrache", "Säure"),
        dragon("gold", "Golddrache", "Feuer"),
        dragon("green", "Grüner Drache", "Gift"),
        dragon("red", "Roter Drache", "Feuer"),
        dragon("silver", "Silberdrache", "Kälte"),
        dragon("white", "Weißer Drache", "Kälte"),
      ],
    },
  },
  {
    id: "dwarf",
    name: "Zwerg",
    summary: "Zäh und ausdauernd, mit weiter Dunkelsicht und einem Gespür für Stein.",
    size: "medium",
    speed: 9,
    darkvision: 36,
    hpPerLevel: 1,
    resistance: "Gift",
    traits: [
      { name: "Dunkelsicht", summary: "Du siehst 36 m weit im Dunkeln wie im Dämmerlicht." },
      { name: "Zwergische Widerstandskraft", summary: "Resistenz gegen Giftschaden und Vorteil bei Rettungswürfen gegen den Zustand Vergiftet." },
      { name: "Zwergische Zähigkeit", summary: "Dein Trefferpunktemaximum steigt um 1 pro Stufe." },
      { name: "Steingespür", summary: "Als Bonusaktion spürst du 10 Minuten lang Erschütterungen durch Stein im Umkreis von 18 m. So oft pro langer Rast wie dein Übungsbonus." },
    ],
  },
  {
    id: "elf",
    name: "Elf",
    summary: "Anmutig und langlebig, mit scharfen Sinnen und einer Verbindung zur Feenwelt.",
    size: "medium",
    speed: 9,
    darkvision: 18,
    spellAbilityChoice: true,
    skillChoice: { count: 1, from: ["insight", "perception", "survival"], label: "Scharfe Sinne" },
    traits: [
      { name: "Dunkelsicht", summary: "Du siehst im Dunkeln wie im Dämmerlicht (18 m, Drow 36 m)." },
      { name: "Feenblut", summary: "Vorteil bei Rettungswürfen gegen den Zustand Bezaubert." },
      { name: "Scharfe Sinne", summary: "Du bist in Motiv erkennen, Wahrnehmung oder Überlebenskunst geübt." },
      { name: "Trance", summary: "Du brauchst keinen Schlaf. Eine lange Rast dauert für dich 4 Stunden meditativer Trance." },
    ],
    option: {
      label: "Elfenlinie",
      options: [
        { id: "drow", name: "Drow", summary: "Dunkelsicht 36 m und der Zaubertrick Tanzende Lichter.", darkvision: 36, cantrips: ["dancing-lights"] },
        { id: "high-elf", name: "Hochelf", summary: "Der Zaubertrick Taschenspielerei; du kannst ihn nach jeder langen Rast gegen einen anderen Magier-Zaubertrick tauschen.", cantrips: ["prestidigitation"] },
        { id: "wood-elf", name: "Waldelf", summary: "Bewegungsrate 10,5 m und der Zaubertrick Druidenkunst.", speed: 10.5 },
      ],
    },
  },
  {
    id: "gnome",
    name: "Gnom",
    summary: "Klein, neugierig und erfinderisch, mit einem wachen Geist gegen Magie.",
    size: "small",
    speed: 9,
    darkvision: 18,
    spellAbilityChoice: true,
    traits: [
      { name: "Dunkelsicht", summary: "Du siehst 18 m weit im Dunkeln wie im Dämmerlicht." },
      { name: "Gnomische Schläue", summary: "Vorteil bei Intelligenz-, Weisheits- und Charismarettungswürfen." },
    ],
    option: {
      label: "Gnomenlinie",
      options: [
        { id: "forest", name: "Waldgnom", summary: "Der Zaubertrick Einfache Illusion; außerdem kannst du mit Tieren sprechen (Übungsbonus-mal pro langer Rast).", cantrips: ["minor-illusion"] },
        { id: "rock", name: "Felsengnom", summary: "Die Zaubertricks Ausbessern und Taschenspielerei; du kannst kleine Spielzeuge und Geräte basteln.", cantrips: ["mending", "prestidigitation"] },
      ],
    },
  },
  {
    id: "goliath",
    name: "Goliath",
    summary: "Hochgewachsen und kräftig, mit dem Erbe von Riesen im Blut.",
    size: "medium",
    speed: 10.5,
    traits: [
      { name: "Kräftiger Körperbau", summary: "Vorteil, um den Zustand Gepackt zu beenden. Beim Tragen zählst du als eine Größe größer." },
      { name: "Großgestalt (ab Stufe 5)", summary: "Ab Stufe 5 kannst du dich für 10 Minuten auf Groß vergrößern." },
    ],
    option: {
      label: "Riesenahnen",
      options: [
        { id: "cloud", name: "Wolkenriese", summary: "Als Bonusaktion teleportierst du dich bis zu 9 m weit (Übungsbonus-mal pro langer Rast)." },
        { id: "fire", name: "Feuerriese", summary: "Bei einem Treffer verursachst du zusätzlich 1W10 Feuerschaden (Übungsbonus-mal pro langer Rast)." },
        { id: "frost", name: "Frostriese", summary: "Bei einem Treffer zusätzlich 1W6 Kälteschaden und das Ziel wird um 3 m verlangsamt (Übungsbonus-mal pro langer Rast)." },
        { id: "hill", name: "Hügelriese", summary: "Bei einem Treffer kannst du ein großes oder kleineres Ziel umstoßen (Übungsbonus-mal pro langer Rast)." },
        { id: "stone", name: "Steinriese", summary: "Als Reaktion verringerst du erlittenen Schaden um 1W12 + KO-Modifikator (Übungsbonus-mal pro langer Rast)." },
        { id: "storm", name: "Sturmriese", summary: "Als Reaktion auf Schaden fügst du dem Angreifer 1W8 Donnerschaden zu (Übungsbonus-mal pro langer Rast)." },
      ],
    },
  },
  {
    id: "halfling",
    name: "Halbling",
    summary: "Klein, mutig und mit einem fast unheimlichen Glück gesegnet.",
    size: "small",
    speed: 9,
    traits: [
      { name: "Tapfer", summary: "Vorteil bei Rettungswürfen gegen den Zustand Verängstigt." },
      { name: "Halblingsflinkheit", summary: "Du kannst dich durch den Bereich jeder Kreatur bewegen, die größer ist als du." },
      { name: "Glück", summary: "Würfelst du bei einem W20-Test eine 1, darfst du neu würfeln und musst das neue Ergebnis nehmen." },
      { name: "Natürlich verstohlen", summary: "Du kannst dich verstecken, wenn dich nur eine Kreatur verdeckt, die größer ist als du." },
    ],
  },
  {
    id: "human",
    name: "Mensch",
    summary: "Anpassungsfähig und ehrgeizig, mit einer zusätzlichen Fertigkeit und einem Herkunftstalent.",
    size: "choice",
    speed: 9,
    skillChoice: { count: 1, from: "any", label: "Geschickt" },
    originFeat: true,
    traits: [
      { name: "Einfallsreich", summary: "Nach jeder langen Rast erhältst du Heldenhafte Inspiration." },
      { name: "Geschickt", summary: "Du bist in einer Fertigkeit deiner Wahl geübt." },
      { name: "Vielseitig", summary: "Du erhältst ein Herkunftstalent deiner Wahl." },
    ],
  },
  {
    id: "orc",
    name: "Ork",
    summary: "Ausdauernd und unermüdlich, mit einem Adrenalinschub im Kampf.",
    size: "medium",
    speed: 9,
    darkvision: 36,
    traits: [
      { name: "Adrenalinschub", summary: "Als Bonusaktion sprintest du und erhältst temporäre Trefferpunkte in Höhe deines Übungsbonus (Übungsbonus-mal pro kurzer oder langer Rast)." },
      { name: "Dunkelsicht", summary: "Du siehst 36 m weit im Dunkeln wie im Dämmerlicht." },
      { name: "Unerbittliche Ausdauer", summary: "Fällst du auf 0 Trefferpunkte, ohne zu sterben, bleibst du einmal pro langer Rast stattdessen mit 1 Trefferpunkt stehen." },
    ],
  },
  {
    id: "tiefling",
    name: "Tiefling",
    summary: "Vom Erbe der unteren Ebenen gezeichnet, mit angeborener Magie.",
    size: "choice",
    speed: 9,
    darkvision: 18,
    spellAbilityChoice: true,
    cantrips: ["thaumaturgy"],
    traits: [
      { name: "Dunkelsicht", summary: "Du siehst 18 m weit im Dunkeln wie im Dämmerlicht." },
      { name: "Jenseitige Präsenz", summary: "Du kennst den Zaubertrick Thaumaturgie." },
    ],
    option: {
      label: "Teuflisches Erbe",
      options: [
        { id: "abyssal", name: "Abyssisch", summary: "Resistenz gegen Gift und der Zaubertrick Giftspritzer.", resistance: "Gift", cantrips: ["poison-spray"] },
        { id: "chthonic", name: "Chthonisch", summary: "Resistenz gegen Nekrotisch und der Zaubertrick Kalte Hand.", resistance: "Nekrotisch", cantrips: ["chill-touch"] },
        { id: "infernal", name: "Infernalisch", summary: "Resistenz gegen Feuer und der Zaubertrick Feuerpfeil.", resistance: "Feuer", cantrips: ["fire-bolt"] },
      ],
    },
  },
];
export const SPECIES_BY_ID: Record<string, Species> = Object.fromEntries(SPECIES.map((s) => [s.id, s]));
