import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite bringt eine WebAssembly-Datenbank mit und darf nicht gebündelt werden
  serverExternalPackages: ["@electric-sql/pglite"],
  // Eigener Build-Ordner, damit ein zweiter Entwicklungsserver (z. B. zum Testen) parallel laufen kann
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
