import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "packages", "schema", "src", "index.js");
const outputDir = path.join(root, "packages", "schema", "dist");
const output = path.join(outputDir, "index.js");

fs.mkdirSync(outputDir, { recursive: true });
fs.copyFileSync(source, output);
console.log(`Built @naavos/schema: ${path.relative(root, output)}`);
