import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listCampaignsForUser, ROLE_LABEL } from "@/lib/campaign";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) return <Landing />;

  const campaigns = await listCampaignsForUser(user.id);
  return (
    <main className="page">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Willkommen, {user.displayName}</p>
          <h1 className="h1 mb-0">Deine Kampagnen</h1>
        </div>
        <Link className="btn btn-primary" href="/kampagnen/neu">Neue Kampagne</Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="card text-muted">
          Du bist noch in keiner Kampagne. Leg eine neue an – oder lass dir von deiner Spielleitung einen
          Einladungslink schicken.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {campaigns.map((c) => (
            <li key={c.id}>
              <Link href={`/kampagnen/${c.id}`} className="card card-link h-full">
                <span className={c.role === "player" ? "badge" : "badge badge-ember"}>{ROLE_LABEL[c.role]}</span>
                <h2 className="h2 mt-2 mb-1">{c.name}</h2>
                {c.description && <p className="hint line-clamp-2">{c.description}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Landing() {
  return (
    <main className="page">
      <section className="mx-auto max-w-2xl py-12 text-center">
        <p className="eyebrow">Pen &amp; Paper online</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight">Erzählfeuer</h1>
        <p className="mt-4 text-lg text-muted">
          Wo die Geschichte im Mittelpunkt steht: Szenen statt Taktikraster, Spiel zwischen den Abenden
          und ein Gedächtnis für die Spielleitung.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link className="btn btn-primary" href="/registrieren">Konto erstellen</Link>
          <Link className="btn" href="/anmelden">Anmelden</Link>
        </div>
        <p className="hint mt-10">Erzählfeuer ist im Aufbau. Was du hier siehst, ist eine frühe Testversion.</p>
      </section>
    </main>
  );
}
