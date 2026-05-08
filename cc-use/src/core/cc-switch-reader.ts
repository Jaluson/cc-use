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
      '未找到 cc-switch 数据库，请确认已安装并配置过 cc-switch',
    );
  }

  const SQL = await initSqlJs();
  const db = new SQL.Database(readFileSync(path));

  try {
    // Check if providers table exists
    const tables = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='providers'",
    );
    if (!tables || tables.length === 0) {
      throw new Error('cc-switch 数据库中未找到 providers 表');
    }

    // Query providers for Claude Code
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

      // Get endpoints for this provider
      const endpoints: string[] = [];
      try {
        const endpointResults = db.exec(
          `SELECT url FROM provider_endpoints WHERE provider_id = '${id}' AND app_type = '${appType}'`,
        );
        if (endpointResults && endpointResults.length > 0) {
          for (const epRow of endpointResults[0].values) {
            endpoints.push(epRow[0] as string);
          }
        }
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
    throw new Error('cc-switch 数据库格式不兼容，可能版本过新/过旧');
  } finally {
    db.close();
  }
}
