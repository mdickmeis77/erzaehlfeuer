import "server-only";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Lokal (ohne DATABASE_URL): eingebettete PostgreSQL-Datenbank (PGlite) im Ordner .data/pglite.
// Auf dem Server: echtes PostgreSQL über DATABASE_URL.
function createDb() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const pool = new Pool({ connectionString: url });
    return drizzlePg({ client: pool, schema }) as unknown as ReturnType<typeof createPgliteDb>;
  }
  return createPgliteDb();
}

function createPgliteDb() {
  const client = new PGlite(process.env.PGLITE_DIR ?? ".data/pglite");
  return drizzlePglite({ client, schema });
}

export type Db = ReturnType<typeof createPgliteDb>;

// Eine Instanz pro Prozess, auch bei Hot Reload im Entwicklungsmodus
const globalForDb = globalThis as unknown as { __erzaehlfeuerDb?: Db };

export function getDb(): Db {
  if (!globalForDb.__erzaehlfeuerDb) {
    globalForDb.__erzaehlfeuerDb = createDb();
  }
  return globalForDb.__erzaehlfeuerDb;
}

export { schema };
