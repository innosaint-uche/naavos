import { execFileSync } from "node:child_process";

const write = process.argv.includes("--write");
const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const extensions = new Set([".js", ".jsx", ".ts", ".tsx", ".json", ".md", ".yaml", ".yml"]);
const roots = [".github/", "apps/", "packages/", "deploy/", "docs/qa/", "docs/reviews/"];
const named = new Set([
  "README.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CODE_OF_CONDUCT.md",
  "ENGINEERING_FOUNDATION_TODO.md",
  "package.json",
  "pnpm-workspace.yaml",
  "turbo.json",
  "tsconfig.base.json",
  ".eslintrc.cjs",
  ".prettierrc"
]);

const files = tracked.filter((file) => {
  const extension = file.slice(file.lastIndexOf("."));
  return extensions.has(extension) && (named.has(file) || roots.some((root) => file.startsWith(root)));
});

if (!files.length) throw new Error("No release-surface files found for formatting");
execFileSync("pnpm", ["exec", "prettier", ...(write ? ["--write"] : ["--check"]), ...files], { stdio: "inherit" });
