import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pins the workspace root to this directory. Without it, Next.js infers
  // the root from the nearest lockfile it finds walking up the filesystem,
  // which on this machine picks up an unrelated lockfile above the repo.
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;
