import { readFile } from "node:fs/promises";
import { access, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url);
const required = [
  "README.md",
  "package.json",
  "tsconfig.json",
  "01_CORE/contracts/module.contract.schema.json",
  "01_CORE/contracts/evidence.contract.schema.json",
  "01_CORE/contracts/approval.contract.schema.json",
  "01_CORE/contracts/safety.contract.schema.json",
  "01_CORE/contracts/core-runtime.manifest.json",
  "01_CORE/runtime/core-types.ts",
  "01_CORE/registry/module-registry.ts",
  "01_CORE/safety/safety-policy.ts"
];

const results = [];
for (const rel of required) {
  try {
    const data = await readFile(new URL(rel, root), "utf8");
    JSON.parse(rel.endsWith(".json") ? data : "{}");
    results.push({check: rel, ok: true});
  } catch (error) {
    results.push({check: rel, ok: false, error: String(error)});
  }
}
const ok = results.every(x => x.ok);
console.log(JSON.stringify({
  status: ok ? "PHASE1_SELFTEST_PASS" : "PHASE1_SELFTEST_FAIL",
  checks: results,
  checked_at: new Date().toISOString()
}, null, 2));
process.exitCode = ok ? 0 : 1;
