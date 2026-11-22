"use client";

import Link from "next/link";
import { useActionState } from "react";
import { joinWaitlist, type WaitlistState } from "@/app/actions/waitlist";
import { WAITLIST_ROLES } from "@/lib/waitlist";

export function WaitlistForm() {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlist, undefined);

  if (state?.done) {
    return (
      <div className="card text-left" role="status">
        <p className="font-semibold">Danke, du stehst auf der Liste! 🔥</p>
        <p className="hint mt-1">Wir melden uns, sobald du Erzählfeuer ausprobieren kannst. Bis dahin: Folge uns auf Instagram unter @erzaehlfeuer.</p>
      </div>
    );
  }

  return (
    <form key={state?.nonce ?? 0} action={action} className="card space-y-3 text-left">
      <label className="field">
        <span>E-Mail-Adresse</span>
        <input className="input" type="email" name="email" required autoComplete="email" placeholder="du@beispiel.de" defaultValue={state?.email} />
      </label>
      <label className="field">
        <span>Am Tisch bist du meistens … (optional)</span>
        <select className="input" name="role" defaultValue={state?.role ?? ""}>
          <option value="">– keine Angabe –</option>
          {WAITLIST_ROLES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      {/* Unsichtbar für Menschen – fängt einfache Bots ab */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Webseite
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="check items-start">
        <input type="checkbox" name="consent" required className="mt-0.5" />
        <span className="text-sm text-muted">
          Ich möchte per E-Mail benachrichtigt werden, sobald ich Erzählfeuer testen kann. Austragen geht jederzeit. Mehr dazu im{" "}
          <Link className="link" href="/datenschutz">
            Datenschutz
          </Link>
          .
        </span>
      </label>
      {state?.error && (
        <p className="error" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Trage ein …" : "Auf die Warteliste"}
      </button>
    </form>
  );
}
