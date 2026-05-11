import { join } from 'node:path';
import { homedir } from 'node:os';
import { existsSync, readFileSync } from 'node:fs';
import initSqlJs from 'sql.js';

export interface CcSwitchProvider {
  id: string;
  name: string;
  env: Record<string, string>;
  providerType: string | null;
  endpoints: string[];
}

export function getCcSwitchDbPath(): string {
  return join(homedir(), '.cc-switch', 'cc-switch.db');
}

export async function readCcSwitchProviders(
  dbPath?: string,
): Promise<CcSwitchProvider[]> {
  const path = dbPath ?? getCcSwitchDbPath();

  if (!existsSync(path)) {
    throw new Error(
      'cc-switch database not found. Please ensure cc-switch is installed and configured.',
    );
  }

  const SQL = await initSqlJs();
  const db = new SQL.Database(readFileSync(path));

  try {
    const tables = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='providers'",
    );
    if (!tables || tables.length === 0) {
      throw new Error('cc-switch database: providers table not found');
    }

    const providerResults = db.exec(
      "SELECT id, app_type, name, settings_config, provider_type FROM providers WHERE app_type = 'claude'",
    );

    if (!providerResults || providerResults.length === 0) {
      return [];
    }

    const providers: CcSwitchProvider[] = [];

    for (const row of providerResults[0].values) {
      const id = row[0] as string;
      const appType = row[1] as string;
      const name = row[2] as string;
      const settingsConfigStr = row[3] as string;
      const providerType = row[4] as string | null;

      let settingsConfig: { env?: Record<string, string> } = {};
      try {
        settingsConfig = JSON.parse(settingsConfigStr);
      } catch {
        // ignore invalid JSON
      }

      // Get endpoints for this provider using parameterized query
      const endpoints: string[] = [];
      try {
        const stmt = db.prepare(
          'SELECT url FROM provider_endpoints WHERE provider_id = ? AND app_type = ?',
        );
        stmt.bind([id, appType]);
        while (stmt.step()) {
          const row = stmt.getAsObject();
          if (row.url) {
            endpoints.push(String(row.url));
          }
        }
        stmt.free();
      } catch {
        // provider_endpoints table may not exist or query may fail
      }

      providers.push({
        id,
        name,
        env: settingsConfig.env ?? {},
        providerType,
        endpoints,
      });
    }

    return providers;
  } catch (error) {
    if (error instanceof Error && error.message.includes('cc-switch')) {
      throw error;
    }
    throw new Error('cc-switch database format is incompatible, version may be too old or too new');
  } finally {
    db.close();
  }
}
