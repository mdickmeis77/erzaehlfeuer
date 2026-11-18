"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register, type FormState } from "@/app/actions/auth";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? login : register, undefined);
  const nextQuery = next !== "/" ? `?weiter=${encodeURIComponent(next)}` : "";

  return (
    <form action={action} className="card space-y-4">
      <input type="hidden" name="weiter" value={next} />
      {mode === "register" && (
        <label className="field">
          <span>Name in der Runde</span>
          <input className="input" name="displayName" required minLength={2} maxLength={40} autoComplete="nickname" />
        </label>
      )}
      <label className="field">
        <span>E-Mail</span>
        <input className="input" type="email" name="email" required autoComplete="email" />
      </label>
      <label className="field">
        <span>Passwort</span>
        <input
          className="input"
          type="password"
          name="password"
          required
          minLength={mode === "register" ? 10 : undefined}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
        />
        {mode === "register" && <small className="hint">Mindestens 10 Zeichen.</small>}
      </label>

      {state?.error && <p className="error" role="alert">{state.error}</p>}

      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Einen Moment …" : mode === "login" ? "Anmelden" : "Konto erstellen"}
      </button>

      <p className="hint text-center">
        {mode === "login" ? (
          <>Noch kein Konto? <Link className="link" href={`/registrieren${nextQuery}`}>Registrieren</Link></>
        ) : (
          <>Schon ein Konto? <Link className="link" href={`/anmelden${nextQuery}`}>Anmelden</Link></>
        )}
      </p>
    </form>
  );
}
