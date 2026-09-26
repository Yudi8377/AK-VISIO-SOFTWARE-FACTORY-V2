import { ModuleRegistry } from "../registry/module-registry.js";
import { builtInModuleCatalog } from "../registry/built-in-modules.js";
import { summarizeHealth } from "../health/health.js";

export function createCoreRuntime() {
  const registry = new ModuleRegistry();
  for (const manifest of builtInModuleCatalog) registry.register(manifest);
  return {
    registry,
    health() {
      return summarizeHealth([
        {name:"module-registry",ok:registry.list().length === builtInModuleCatalog.length},
        {name:"offline-policy",ok:true},
        {name:"approval-gate",ok:true}
      ]);
    }
  };
}
