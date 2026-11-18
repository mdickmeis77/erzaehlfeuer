// Spielt alle Datenbank-Migrationen aus dem Ordner "drizzle" ein.
// Lokal automatisch vor "npm run dev"; auf dem Server vor dem Start der App.
import { mkdirSync } from "node:fs";

const migrationsFolder = "drizzle";

async function main() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const pool = new Pool({ connectionString: url });
    await migrate(drizzle({ client: pool }), { migrationsFolder });
    await pool.end();
  } else {
    const dir = process.env.PGLITE_DIR ?? ".data/pglite";
    mkdirSync(dir, { recursive: true });
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    const client = new PGlite(dir);
    await migrate(drizzle({ client }), { migrationsFolder });
    await client.close();
  }
  console.log("Datenbank ist auf dem neuesten Stand.");
}

main().catch((err) => {
  console.error("Migration fehlgeschlagen:", err);
  process.exit(1);
});
