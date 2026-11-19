export const metadata = { title: "Datenschutz – Erzählfeuer" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="h2 mb-1">{title}</h2>
      {children}
    </section>
  );
}

// Entwurf in einfacher Sprache. Vor dem öffentlichen Start rechtlich prüfen lassen und Platzhalter füllen.
export default function PrivacyPage() {
  return (
    <main className="page max-w-2xl">
      <h1 className="h1">Datenschutz</h1>
      <div className="card space-y-6 text-muted">
        <p className="badge badge-ember">Entwurf – wird vor dem öffentlichen Start rechtlich geprüft</p>

        <Section title="Wer ist verantwortlich?">
          <p>[Name und Anschrift des Betreibers wie im Impressum], E-Mail: [E-Mail-Adresse]</p>
        </Section>

        <Section title="Warteliste">
          <p>
            Wenn du dich auf die Warteliste einträgst, speichern wir deine E-Mail-Adresse, optional deine Rolle am Spieltisch und den Zeitpunkt deiner
            Einwilligung. Wir nutzen die Daten nur, um dich über den Start von Erzählfeuer und Testrunden zu informieren.
          </p>
          <p>
            Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Du kannst sie jederzeit widerrufen: über den Link zum Austragen in jeder
            E-Mail oder mit einer kurzen Nachricht an uns. Dann löschen wir deine Adresse.
          </p>
        </Section>

        <Section title="Konto und Spiel">
          <p>
            Für ein Konto speichern wir deine E-Mail-Adresse, deinen Anzeigenamen und dein Passwort (nur verschlüsselt als Hash). Dazu kommen die Inhalte,
            die du im Spiel erstellst: Kampagnen, Szenen, Beiträge, Würfe und Charaktere. Rechtsgrundlage ist die Bereitstellung des Dienstes (Art. 6 Abs. 1
            lit. b DSGVO).
          </p>
          <p>Wir setzen nur ein technisch notwendiges Cookie, damit du angemeldet bleibst. Es gibt kein Tracking und keine Werbe-Cookies.</p>
        </Section>

        <Section title="Hosting">
          <p>Erzählfeuer läuft auf einem eigenen Server in [Land/Rechenzentrum, z. B. Deutschland]. Schriftarten werden von unserem Server geladen, nicht von Google.</p>
        </Section>

        <Section title="KI-Funktionen">
          <p>
            Später fassen KI-Funktionen Kampagnen zusammen. Dafür werden Kampagneninhalte an einen KI-Anbieter übertragen. Bevor das startet, ergänzen wir
            hier Anbieter und Details und informieren dich in der App.
          </p>
        </Section>

        <Section title="Deine Rechte">
          <p>
            Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Außerdem kannst du
            dich bei einer Datenschutz-Aufsichtsbehörde beschweren.
          </p>
        </Section>
      </div>
    </main>
  );
}
