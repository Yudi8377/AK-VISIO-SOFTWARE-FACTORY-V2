import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export class CoreDatabase {
  readonly db: DatabaseSync;
  constructor(filePath = "ak-visio-engineer.db") {
    this.db = new DatabaseSync(filePath);
    const schemaPath = resolve(process.cwd(), "01_CORE/db/schema.sql");
    this.db.exec(readFileSync(schemaPath, "utf8"));
  }
  health(): { ok: boolean; schemaVersion: string } {
    const row = this.db.prepare("SELECT value FROM schema_meta WHERE key = 'schema_version'").get() as { value?: string } | undefined;
    return { ok: row?.value === "1.0.0", schemaVersion: row?.value ?? "unknown" };
  }
  close(): void { this.db.close(); }
}
