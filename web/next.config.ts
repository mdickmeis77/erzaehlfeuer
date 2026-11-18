import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite bringt eine WebAssembly-Datenbank mit und darf nicht gebündelt werden
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
