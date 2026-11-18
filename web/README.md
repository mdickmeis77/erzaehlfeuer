# Erzählfeuer – Web-App

Next.js (TypeScript) mit Drizzle ORM. Lokal läuft eine eingebettete PostgreSQL-Datenbank (PGlite),
auf dem Server ein echtes PostgreSQL über `DATABASE_URL`. Konzept und Entscheidungen: [`../KONZEPT.md`](../KONZEPT.md).

## Lokal starten

```bash
cd web
npm install
npm run dev
```

Dann <http://localhost:3000> öffnen. `npm run dev` spielt vorher automatisch alle Datenbank-Migrationen ein.
Testkonten zum Durchklicken: [`TESTKONTEN.md`](TESTKONTEN.md).

## Befehle

| Befehl | Was er tut |
| --- | --- |
| `npm run dev` | Migrationen einspielen, Entwicklungsserver starten |
| `npm test` | Tests (Würfel, Sichtbarkeitsregeln) |
| `npm run lint` | Code-Prüfung |
| `npm run build` | Produktions-Build |
| `npm run db:generate` | Neue Migration aus `src/db/schema.ts` erzeugen |
| `npm run db:migrate` | Migrationen einspielen |

## Aufbau

| Ordner | Inhalt |
| --- | --- |
| `src/db` | Datenbank-Schema, Verbindung, Migrations-Skript |
| `drizzle` | Erzeugte SQL-Migrationen (mit committen) |
| `src/lib` | Logik: Anmeldung, Würfel, Sichtbarkeitsregeln, Kampagnen, Szenen |
| `src/app` | Seiten und Server-Aktionen |
| `src/components` | Wiederverwendbare Oberflächen-Bausteine |

## Sichtbarkeit (wichtig)

Alles, was Posts oder Szenen an Spieler ausliefert, läuft über `src/lib/visibility.ts`.
SL-Notizen, verdeckte Würfe und Geflüstertes werden schon auf dem Server herausgefiltert und
erreichen den Browser von Spielern nie. Die Regeln sind in `visibility.test.ts` abgesichert.
