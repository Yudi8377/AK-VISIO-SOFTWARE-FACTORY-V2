import type { ModuleManifest } from "../runtime/core-types.js";

export class ModuleRegistry {
  private readonly modules = new Map<string, ModuleManifest>();

  register(manifest: ModuleManifest): void {
    if (this.modules.has(manifest.module_id)) {
      throw new Error(`Module already registered: ${manifest.module_id}`);
    }
    this.modules.set(manifest.module_id, structuredClone(manifest));
  }

  get(moduleId: string): ModuleManifest | undefined {
    return this.modules.get(moduleId);
  }

  list(): ModuleManifest[] {
    return [...this.modules.values()].map(m => structuredClone(m));
  }

  remove(moduleId: string): boolean {
    return this.modules.delete(moduleId);
  }
}
