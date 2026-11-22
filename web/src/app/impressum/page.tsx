export const metadata = { title: "Impressum – Erzählfeuer" };

// Die Angaben trägt der Betreiber vor dem öffentlichen Start ein (siehe KONZEPT.md, offene Punkte).
export default function ImprintPage() {
  return (
    <main className="page max-w-2xl">
      <h1 className="h1">Impressum</h1>
      <div className="card space-y-3">
        <p className="badge badge-ember">Entwurf – wird vor dem öffentlichen Start ergänzt</p>
        <p className="text-muted">Angaben gemäß § 5 DDG:</p>
        <p>
          [Name des Betreibers]
          <br />
          [Straße und Hausnummer]
          <br />
          [PLZ und Ort]
        </p>
        <p>
          Kontakt: [E-Mail-Adresse]
        </p>
      </div>
    </main>
  );
}
