import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listCampaignsForUser, ROLE_LABEL } from "@/lib/campaign";
import { WaitlistForm } from "@/components/WaitlistForm";

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

const FEATURES = [
  { title: "Erzählung statt Raster", text: "Szenen, Stimmung und Beschreibung. Kämpfe laufen ohne Taktikkarte – mit Initiative, Trefferpunkten und Zuständen." },
  { title: "Spiel zwischen den Abenden", text: "Kleine Szenen am Handy, mit Nachricht, sobald du an der Reihe bist. Live und asynchron im selben Ablauf." },
  { title: "Hilfe für die Spielleitung", text: "Ein Kampagnen-Gedächtnis merkt sich Personen, Orte und offene Fäden. Die KI hilft – sie leitet nicht." },
  { title: "Geheimnisse bleiben geheim", text: "Verdeckte Würfe, Flüstern und private Szenen. Spieler sehen nur, was ihre Charaktere wissen." },
];

const STATUS = [
  { done: true, text: "Kampagnen, Einladungen, Szenen mit Würfeln" },
  { done: true, text: "Charakter-Assistent und Charakterbogen (Stufe 1)" },
  { done: false, text: "Stufenaufstieg, Kampf ohne Karte, Kampagnen-Gedächtnis" },
  { done: false, text: "Erste offene Testrunden" },
];

function Landing() {
  return (
    <main className="page">
      <section className="mx-auto grid max-w-5xl items-center gap-10 py-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="eyebrow">Pen &amp; Paper online · im Aufbau</p>
          <h1 className="mt-3 font-serif text-5xl leading-tight">Erzählfeuer</h1>
          <p className="mt-4 text-lg text-muted">
            Wo die Geschichte im Mittelpunkt steht. Spielt eure Kampagne am Spieltisch, am Discord-Abend und dazwischen am Handy weiter – auf Deutsch, nach
            den offenen Regeln der 5. Edition.
          </p>
          <p className="mt-4 text-muted">Trag dich ein und sei bei den ersten Testrunden dabei.</p>
        </div>
        <WaitlistForm />
      </section>

      <section className="mx-auto mt-6 grid max-w-5xl gap-3 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="card">
            <h2 className="h2 mb-1">{f.title}</h2>
            <p className="text-muted">{f.text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-10 max-w-5xl">
        <h2 className="h2">Wo wir stehen</h2>
        <ul className="card space-y-2">
          {STATUS.map((s) => (
            <li key={s.text} className="flex items-start gap-3">
              <span className={`dot mt-1.5 ${s.done ? "dot-on" : ""}`} aria-hidden />
              <span className={s.done ? "" : "text-muted"}>
                {s.text}
                <span className="sr-only">{s.done ? " (fertig)" : " (geplant)"}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="hint mt-3">
          Gebaut mit KI als Werkzeug – für Menschen am Tisch. Die Entwicklung zeigen wir offen auf Instagram: @erzaehlfeuer. Schon eingeladen?{" "}
          <Link className="link" href="/anmelden">
            Anmelden
          </Link>
        </p>
      </section>
    </main>
  );
}
