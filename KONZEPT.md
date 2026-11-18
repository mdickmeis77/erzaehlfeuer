# Konzept: Erzählfeuer

Stand: 2026-11-17 · Entwurf · Online-Fassung zum Kommentieren: https://claude.ai/artifact/LuQBgUrL2qwvfNZBZ8w9oE

> Diese Datei ist der Bauplan für die Umsetzung. Bei Abweichungen gilt die zuletzt geänderte Fassung; Änderungen bitte in beiden nachziehen.

## 1. Vision und Zielgruppe

**Eine einfache Browser-Plattform für deutschsprachige 5e-Runden, bei der die Geschichte im Mittelpunkt steht, die Kampagne zwischen den Spielabenden weiterlebt und eine KI der Spielleitung die Vorbereitung abnimmt.**

- Zielgruppe: Rollenspielgruppen im DACH-Raum, die nach SRD 5.2 spielen
- Abgrenzung zu Roll20 / Foundry VTT (englischlastig, kartenzentriert, vorbereitungsintensiv)

| Alleinstellungsmerkmal | Was es für Nutzer heißt |
| --- | --- |
| Weniger Vorbereitung für die Spielleitung | KI merkt sich die Kampagne und fasst Sessions zusammen |
| Live und async nahtlos | Zwischen den Spielabenden geht das Spiel in Szenen weiter |
| Einfach statt mächtig | Läuft sofort im Browser und auf dem Handy, ohne Einarbeitung |
| Erzählung statt Taktikkarte | Szenen, Beschreibungen, Handouts; Kämpfe ohne Raster |

## 2. Grundentscheidungen

| Bereich | Entscheidung |
| --- | --- |
| Ziel | Kommerzielles Produkt; MVP zuerst mit eigener Runde |
| Spielmodus | Live und asynchron, beides über Szenen-Threads |
| Regelwerk | SRD 5.2 (CC-BY 4.0), ins Deutsche übersetzt |
| Markt | DACH zuerst, Englisch später |
| KI-Rolle | Assistenz für die Spielleitung, keine KI-Spielleitung |
| Geräte | Web-App für PC und Handy (PWA) |
| Umsetzung | Claude programmiert, Produktverantwortlicher steuert und testet |
| Budget MVP | bis ca. 20 € / Monat (eigener Server vorhanden, nur KI-Kosten) |
| Hosting | Eigener, gemieteter Linux-Server mit Docker |
| Zeitplan | Hobby-Tempo, kein Termindruck |
| Preismodell | offen, Entscheidung vor dem öffentlichen Start |

## 3. Spielerlebnis

### Szenen-Threads (Kernkonzept)

Live- und Async-Spiel nutzen **dasselbe** System. Eine Live-Session ist eine Szene, in der alle gleichzeitig posten.

- Die Spielleitung eröffnet Szenen (Titel, Beschreibung, beteiligte Charaktere).
- Spieler posten Aktionen als Text, Würfe stehen direkt im Post.
- Live: Posts und Würfe erscheinen bei allen sofort (Echtzeit). Sprache läuft extern (z. B. Discord).
- Async: Push-Benachrichtigung, wenn jemand an der Reihe ist oder angesprochen wird.
- Eine Kampagne kann mehrere Szenen gleichzeitig haben.

### Kampf ohne Karte

- Initiative-Liste
- Trefferpunkte und Zustände je Teilnehmer
- Entfernungen als Zonen (Nahkampf / nah / fern) statt Raster
- Später: optionales Bild mit verschiebbaren Markern

### Charaktere

- Geführter Assistent: Volk → Klasse → Hintergrund → Werte → Ausrüstung
- SRD-Regeln werden automatisch angewendet
- Charakterbogen ist mit Würfeln verknüpft (Klick auf Fertigkeit = Wurf mit richtigem Bonus)

### Ablauf einer typischen Woche

1. Vorbereitung: KI liefert der Spielleitung Zusammenfassung und offene Plotfäden.
2. Spielabend als Live-Szene, Sprache über Discord.
3. Danach: KI-Zusammenfassung für alle.
4. Unter der Woche: kleine Async-Szenen mit Benachrichtigungen.
5. KI nimmt neue Personen, Orte und Ereignisse ins Kampagnen-Gedächtnis auf.

## 3a. Rollen und Geheimnisse

| Rolle | Darf |
| --- | --- |
| Spielleitung (SL) | Kampagne verwalten, Szenen eröffnen, Spieler und Co-SL einladen, alles sehen |
| Co-Spielleitung | Wie SL, außer Kampagne löschen oder übergeben |
| Spieler | Eigene Charaktere führen, in freigegebenen Szenen posten und würfeln |

Geheimhaltung (alles im MVP):

| Funktion | Was sie tut |
| --- | --- |
| Geheime SL-Notizen | Nur für SL / Co-SL sichtbar |
| Verdeckte Würfe | Spieler sehen nur, dass gewürfelt wurde |
| Flüstern und private Szenen | Private Nachrichten SL ↔ Spieler; Szenen nur für bestimmte Charaktere |
| Getrenntes KI-Wissen | KI-Gedächtnis unterscheidet SL- und Spielerwissen; Spieler-Zusammenfassungen enthalten nur, was ihre Charaktere wissen können |

> Technische Konsequenz: Jeder gespeicherte Inhalt (Post, Notiz, Wurf, Gedächtnis-Eintrag) braucht eine Sichtbarkeit (alle / nur SL / bestimmte Charaktere). Die KI darf für Spieler nur Inhalte mit passender Sichtbarkeit verwenden.

## 3b. Bildschirm-Skizzen (MVP)

Skizzen als Grafik im Online-Konzept. Spieler nutzen vor allem das Handy, die Spielleitung leitet live am PC. Alle Namen und Werte sind Beispiele.

| # | Bildschirm | Gerät | Inhalt |
| --- | --- | --- | --- |
| 1 | Kampagnenübersicht | Handy | Szenenliste (hervorgehoben: „Du bist dran“), private Szenen gestrichelt, „Was bisher geschah“ (KI, nur Spielerwissen), Navigation: Szenen · Charakter · Gedächtnis · Mehr |
| 2 | Szene | Handy | SL-Posts hinterlegt, Spieler-Posts mit Würfelergebnis im Post, Hinweis auf verdeckte SL-Würfe, Geflüstertes gestrichelt, Eingabe mit W20-Knopf und Senden |
| 3 | Charakterbogen | Handy | Attribute mit Modifikatoren, TP-Balken, Rüstung/Initiative/Bewegung, Fertigkeiten mit Bonus (Tippen = Würfeln, Ergebnis kann in die Szene gepostet werden) |
| 4 | Charakter-Assistent | Handy | 5 Schritte (Volk, Klasse, Hintergrund, Werte, Ausrüstung) mit Fortschrittsbalken, Auswahlkarten, Zurück/Weiter |
| 5 | Spielleitung live | PC | 3 Spalten: Szenenliste · laufende Szene mit Schaltern (verdeckt würfeln, flüstern, als NSC) · Initiative mit TP und Zuständen, geheime SL-Notizen, Kampagnen-Gedächtnis mit Quellenangabe |

## 4. KI-Assistenz

| Phase | Funktion | Was sie tut |
| --- | --- | --- |
| MVP | Kampagnen-Gedächtnis | Merkt sich NSCs, Orte, Gegenstände, Plotfäden; beantwortet Fragen zur Kampagne |
| MVP | Session-Zusammenfassung | „Was bisher geschah“ für Szenen und Spielabende |
| Phase 2 | Spontane Inhalte | NSC, Taverne, Beute, Beschreibung passend zur Kampagne |
| Phase 3 | Regelhilfe | Regelfragen auf Basis des SRD 5.2 |

Grundsätze:

- Die Spielleitung behält die Kontrolle: KI-Vorschläge werden geprüft, nie automatisch veröffentlicht.
- Nutzer werden informiert, dass Kampagneninhalte an einen KI-Anbieter gehen.
- KI-Kosten müssen vom späteren Preismodell gedeckt sein.
- Die KI trennt SL-Wissen und Spielerwissen (siehe 3a).

## 5. MVP-Umfang und Roadmap

### MVP (Test mit eigener Runde)

- [ ] Konto und Login
- [ ] Kampagne anlegen, Spieler per Einladungslink hinzufügen
- [ ] Charakter-Assistent nach SRD 5.2: Kämpfer, Schurke, Kleriker, Magier, Stufe 1–5 (Stufe 1 fertig, Aufstieg auf 2–5 folgt)
- [ ] Szenen-Threads mit Echtzeit (live) und Benachrichtigungen (async)
- [ ] Würfel, verknüpft mit dem Charakterbogen
- [ ] Kampf ohne Karte: Initiative, Trefferpunkte, Zustände
- [ ] Push-Benachrichtigungen (PWA)
- [ ] KI: Kampagnen-Gedächtnis
- [ ] KI: Session-Zusammenfassung
- [ ] Rollen (SL, Co-SL, Spieler) und Geheimhaltung (SL-Notizen, verdeckte Würfe, Flüstern/private Szenen, getrenntes KI-Wissen)

**Meilenstein:** Eigene Runde spielt regelmäßig damit → weiter zu Phase 2.

### Phase 2 – Ausbau

- KI: spontane Inhalte
- Kampfbild mit Markern
- Weitere SRD-Klassen

### Phase 3 – Volles Regelwerk

- KI: Regelhilfe
- Alle SRD-Klassen, Stufe 1–20

**Meilenstein:** Entwickler- und Rechtsprüfung bestanden → Marktstart.

### Marktstart (DACH, kostenpflichtig)

- Preismodell und Bezahlung
- Impressum, AGB, DSGVO-Unterlagen
- Danach: Englisch

## 6. Rechtliches (keine Rechtsberatung)

**SRD 5.2 (CC-BY 4.0)**

- Erlaubt: nutzen, übersetzen, kommerziell verwenden
- Pflicht: sichtbare Quellenangabe mit dem vorgegebenen Hinweistext von Wizards of the Coast
- Tabu: Marken „Dungeons & Dragons“ / „D&D“ und Inhalte außerhalb des SRD (z. B. Forgotten Realms, Waterdeep, Beholder)
- *Das Schwarze Auge* ist nicht offen lizenziert

**DSGVO**

- Datenschutzerklärung inkl. KI-Anbieter
- Auftragsverarbeitungsverträge mit Server-Hoster und KI-Anbieter
- Server und Datenbank in der EU
- Löschmöglichkeit für Konten und Kampagnen

**Betrieb**

- Impressum, AGB
- Meldefunktion für Inhalte
- Gewerbeanmeldung, sobald Einnahmen fließen

## 7. Technik

Das MVP läuft auf einem eigenen, gemieteten Linux-Server (≥ 4 GB RAM, eigene Domain vorhanden). Hosting und Datenbank kosten nichts extra; es bleiben nur KI-Kosten.

| Baustein | Lösung | Kosten im MVP |
| --- | --- | --- |
| Server | Gemieteter Linux-Server | vorhanden |
| App (Frontend + Backend) | Next.js (TypeScript) in Docker | – |
| Datenbank | PostgreSQL in Docker | – |
| Login | Login-Bibliothek in der App | – |
| Echtzeit | WebSockets in der App | – |
| HTTPS | Caddy mit automatischen Zertifikaten | kostenlos |
| Handy + Push | Progressive Web App (PWA) | – |
| KI | Claude API | wenige € / Monat |

Alle Dienste laufen über Docker Compose, damit ein späterer Umzug machbar bleibt.

### Betrieb (soll ohne Eingriff laufen)

Claude arbeitet nur in einer geöffneten Sitzung, deshalb:

- Automatische Sicherheitsupdates des Betriebssystems
- Container starten nach Absturz oder Server-Neustart automatisch neu
- Tägliches Datenbank-Backup auf externen Speicher (nicht derselbe Server)
- Warnung per Mail, wenn die Plattform nicht erreichbar ist
- Firewall: nur HTTPS und SSH offen; SSH nur mit Schlüssel, kein Passwort-Login
- Eigener Benutzer für Claude; SSH-Schlüssel richtet der Produktverantwortliche ein

### Vor dem Marktstart

- Betrieb neu bewerten: professioneller Admin oder Umzug zu verwalteten Diensten
- Prüfung durch erfahrenen Entwickler (Sicherheit, Datenschutz, Wartbarkeit)

## 7a. Gestaltung und Name

- Optik: **modern mit Fantasy-Akzenten** – klar und gut lesbar (auch am Handy), Stimmung über Farben, Überschriften-Schrift und Szenenbilder, keine Pergament-Texturen.
- Produktname: **Erzählfeuer** (entschieden 2026-11-17).

| Prüfung 2026-11-17 | Erzählfeuer | Würfelstube (verworfen) |
| --- | --- | --- |
| Marken in TMview (DPMA, EUIPO u. a.) | keine | DPMA-Anmeldung 2024, Klassen 28 + 41, Status beendet |
| Domains .de, .com | ohne DNS-Eintrag, vermutlich frei | vergeben |
| Domains .app, .eu, .net | ohne DNS-Eintrag, vermutlich frei | ohne DNS-Eintrag |

TMview ist kein amtliches Register, ein fehlender DNS-Eintrag ist kein sicherer Beweis für eine freie Domain.

## 7b. Community und Kommunikation

Öffentliche Entwicklung: Discord-Server als Zuhause der Community, Instagram als sichtbarer Kanal, 1 Beitrag pro Woche ab dem ersten Prototyp. Ziel: Interesse am Markt früh prüfen, Testrunden nach dem MVP finden.

| Kanal | Rolle | Inhalte |
| --- | --- | --- |
| Discord-Server | Zuhause der Community | Fortschritt, Abstimmungen, Feedback, später Testrunden-Anmeldung |
| Instagram | Sichtbarkeit | Bildschirm-Einblicke, kurze Videos, Story-Umfragen |

**Zeitplan**

1. Jetzt: Konten „erzaehlfeuer“ auf Instagram und Discord anlegen; Namen auf TikTok, Bluesky, YouTube sichern. Noch nicht posten.
2. Ab erstem Prototyp (z. B. Bildschirm-Skizzen): 1 Beitrag pro Woche.
3. Nach dem MVP: Testrunden aus der Community.

**Mitentscheiden**

| Community stimmt ab | Bleibt beim Produktverantwortlichen |
| --- | --- |
| Optik: Farbwelten, Logo-Entwürfe | Vision und Kernversprechen |
| Roadmap-Reihenfolge (z. B. nächste Klasse) | MVP-Umfang |
| Funktionsideen Phase 2 und 3 | Preismodell |
| Namen in der App | Technik und Datenschutz |

**Umgang mit KI** (Teile der Szene sind sehr KI-kritisch)

- Offen erzählen, dass Erzählfeuer ohne Programmierkenntnisse mit KI gebaut wird.
- Botschaft: KI ist Werkzeug für die Spielleitung, ersetzt keine Menschen.
- Keine KI-Bilder für Logo, Szenenbilder, Werbung.
- Kritik sachlich beantworten, nicht löschen.

Impressumspflicht für geschäftsmäßige Accounts vor dem ersten Beitrag klären.

## 8. Offene Punkte

- [x] Produktname (entschieden: Erzählfeuer)
- [ ] Domain erzaehlfeuer.de (und erzählfeuer.de) zeitnah registrieren
- [ ] Anmeldung der Wortmarke „Erzählfeuer“ beim DPMA vor dem Marktstart prüfen (z. B. Klassen 9, 41, 42)
- [x] Optik und Stimmung (entschieden: modern mit Fantasy-Akzenten)
- [ ] Preismodell (Option: Abo nur für die Spielleitung, Spieler kostenlos)
- [ ] KI-Nutzungsgrenze pro Kampagne
- [ ] Reihenfolge und Prüfung der SRD-Übersetzung
- [ ] Entwickler- und Rechtsprüfung vor Marktstart einplanen
- [ ] Serverstandort in der EU bestätigen und externes Backup-Ziel festlegen
- [ ] SSH-Schlüssel für Claude auf dem Server einrichten
- [ ] Subdomain für die Plattform festlegen und auf den Server zeigen lassen
- [ ] Konten „erzaehlfeuer“ anlegen: Instagram und Discord-Server; Namen auf TikTok, Bluesky, YouTube sichern
- [ ] Impressum für Social Media klären (Impressums-Dienst oder Gewerbeanmeldung), vor dem ersten Beitrag
- [ ] Budget für ein von Menschen gestaltetes Logo einplanen
