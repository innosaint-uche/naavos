import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schemaDir = path.join(root, "packages", "schema");

/**
 * Build @naavos/schema from TypeScript source.
 * Compiles src/index.ts → dist/index.js + dist/index.d.ts
 */
console.log("Building @naavos/schema...");
execFileSync("pnpm", ["exec", "tsc", "-p", "tsconfig.json"], {
  cwd: schemaDir,
  stdio: "inherit",
});

// Verify output exists
import fs from "node:fs";
const output = path.join(schemaDir, "dist", "index.js");
if (!fs.existsSync(output)) {
  throw new Error(`Build failed: ${output} not found`);
}
console.log(`✅ Built @naavos/schema → ${path.relative(root, output)}`);
