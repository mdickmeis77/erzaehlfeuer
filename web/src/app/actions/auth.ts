"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { createSession, destroySession, hashPassword, safeNext, verifyPassword } from "@/lib/auth";

export type FormState = { error?: string } | undefined;

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function register(_: FormState, fd: FormData): Promise<FormState> {
  const displayName = str(fd, "displayName");
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");

  if (displayName.length < 2 || displayName.length > 40) return { error: "Der Name muss 2 bis 40 Zeichen lang sein." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Bitte eine gültige E-Mail-Adresse angeben." };
  if (password.length < 10) return { error: "Das Passwort muss mindestens 10 Zeichen lang sein." };

  const db = getDb();
  const [existing] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email));
  if (existing) return { error: "Zu dieser E-Mail-Adresse gibt es schon ein Konto." };

  const [user] = await db
    .insert(schema.users)
    .values({ displayName, email, passwordHash: await hashPassword(password) })
    .returning({ id: schema.users.id });

  await createSession(user.id);
  redirect(safeNext(fd.get("weiter")));
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");

  const [user] = await getDb().select().from(schema.users).where(eq(schema.users.email, email));
  // Gleiche Meldung für unbekannte E-Mail und falsches Passwort
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "E-Mail oder Passwort stimmt nicht." };
  }

  await createSession(user.id);
  redirect(safeNext(fd.get("weiter")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
