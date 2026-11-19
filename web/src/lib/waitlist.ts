// Prüfregeln für die Warteliste (ohne Datenbank, damit sie testbar sind)

export const WAITLIST_ROLES = [
  { id: "gm", label: "Ich leite meistens" },
  { id: "player", label: "Ich spiele meistens" },
  { id: "both", label: "Beides" },
  { id: "new", label: "Ich bin neu im Hobby" },
] as const;
export type WaitlistRole = (typeof WAITLIST_ROLES)[number]["id"];

export function normalizeEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  if (email.length < 6 || email.length > 254) return null;
  // Bewusst einfach: genau ein @, Punkt in der Domain, keine Leerzeichen
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  return email;
}

export function parseRole(input: string): WaitlistRole | null {
  return WAITLIST_ROLES.some((r) => r.id === input) ? (input as WaitlistRole) : null;
}

// Wer die Warteliste einsehen darf: E-Mail-Adressen aus der Umgebungsvariable ADMIN_EMAILS (kommagetrennt)
export function isAdminEmail(email: string, env = process.env.ADMIN_EMAILS ?? ""): boolean {
  const admins = env
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.trim().toLowerCase());
}
