"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { isAdminEmail, normalizeEmail, parseRole } from "@/lib/waitlist";

// Bei Fehlern gehen die Eingaben zurück, damit das Formular sie wieder anzeigt (React leert es nach dem Absenden)
export type WaitlistState = { error?: string; done?: boolean; email?: string; role?: string; nonce?: number } | undefined;

export async function joinWaitlist(_: WaitlistState, fd: FormData): Promise<WaitlistState> {
  // Unsichtbares Feld: Menschen lassen es leer, einfache Bots füllen es aus
  if (String(fd.get("website") ?? "") !== "") return { done: true };

  const rawEmail = String(fd.get("email") ?? "").slice(0, 254);
  const rawRole = String(fd.get("role") ?? "");
  const fail = (error: string): WaitlistState => ({ error, email: rawEmail, role: rawRole, nonce: Date.now() });

  const email = normalizeEmail(rawEmail);
  if (!email) return fail("Bitte gib eine gültige E-Mail-Adresse ein.");
  if (fd.get("consent") !== "on") return fail("Bitte bestätige, dass wir dich per E-Mail benachrichtigen dürfen.");
  const role = parseRole(rawRole);

  // Schon eingetragen? Dieselbe Antwort wie bei Erfolg – so lässt sich nicht herausfinden, wer auf der Liste steht.
  await getDb()
    .insert(schema.waitlist)
    .values({ email, role, consentAt: new Date(), unsubscribeToken: randomBytes(18).toString("base64url") })
    .onConflictDoNothing({ target: schema.waitlist.email });

  return { done: true };
}

export async function leaveWaitlist(token: string) {
  if (!/^[A-Za-z0-9_-]{10,64}$/.test(token)) return;
  await getDb().delete(schema.waitlist).where(eq(schema.waitlist.unsubscribeToken, token));
}

export async function removeWaitlistEntry(id: string) {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) return;
  await getDb().delete(schema.waitlist).where(eq(schema.waitlist.id, id));
  revalidatePath("/warteliste/uebersicht");
}
