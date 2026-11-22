import { notFound } from "next/navigation";
import { desc } from "drizzle-orm";
import { removeWaitlistEntry } from "@/app/actions/waitlist";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { WAITLIST_ROLES, isAdminEmail } from "@/lib/waitlist";

export const metadata = { title: "Warteliste – Erzählfeuer", robots: { index: false } };

const dateFmt = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeZone: "Europe/Berlin" });

// Nur für Konten, deren E-Mail in ADMIN_EMAILS steht
export default async function WaitlistOverviewPage() {
  const user = await requireUser("/warteliste/uebersicht");
  if (!isAdminEmail(user.email)) notFound();

  const rows = await getDb().select().from(schema.waitlist).orderBy(desc(schema.waitlist.createdAt));
  const byRole = WAITLIST_ROLES.map((r) => ({ ...r, n: rows.filter((x) => x.role === r.id).length }));

  return (
    <main className="page max-w-3xl">
      <p className="eyebrow">Nur für dich sichtbar</p>
      <h1 className="h1">Warteliste</h1>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <div className="stat">
          <div className="stat-label">Gesamt</div>
          <div className="stat-value">{rows.length}</div>
        </div>
        {byRole.map((r) => (
          <div key={r.id} className="stat">
            <div className="stat-label">{r.label.replace("Ich ", "").replace(" meistens", "")}</div>
            <div className="stat-value">{r.n}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="card text-muted">Noch niemand auf der Warteliste.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="card flex flex-wrap items-center gap-3 !p-3">
              <span className="flex-1 break-all">{r.email}</span>
              <span className="hint">{WAITLIST_ROLES.find((x) => x.id === r.role)?.label ?? "–"}</span>
              <span className="hint">{dateFmt.format(r.createdAt)}</span>
              <form action={removeWaitlistEntry.bind(null, r.id)}>
                <button className="btn btn-quiet text-sm">Entfernen</button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <p className="hint mt-4">Bestätigungs- und Benachrichtigungsmails kommen, sobald Erzählfeuer auf dem Server läuft und Mails verschicken kann.</p>
    </main>
  );
}
