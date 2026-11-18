export const metadata = { title: "Lizenzhinweis – Erzählfeuer" };

export default function LicensePage() {
  return (
    <main className="page max-w-2xl">
      <h1 className="h1">Lizenzhinweis</h1>
      <div className="card space-y-3">
        <p>
          Erzählfeuer nutzt Spielregeln aus dem System Reference Document 5.2. Wir haben die Regeln ins Deutsche übertragen, gekürzt und in eigenen Worten
          zusammengefasst. Erzählfeuer ist ein unabhängiges Projekt und steht in keiner Verbindung zu Wizards of the Coast.
        </p>
        <p lang="en" className="text-muted">
          This work includes material from the System Reference Document 5.2 (“SRD 5.2”) by Wizards of the Coast LLC, available at{" "}
          <a className="link" href="https://www.dndbeyond.com/srd" rel="noreferrer">
            https://www.dndbeyond.com/srd
          </a>
          . The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at{" "}
          <a className="link" href="https://creativecommons.org/licenses/by/4.0/legalcode" rel="noreferrer">
            https://creativecommons.org/licenses/by/4.0/legalcode
          </a>
          .
        </p>
      </div>
    </main>
  );
}
