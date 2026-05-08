import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import initSqlJs from 'sql.js';
import { readCcSwitchProviders } from '../../src/core/cc-switch-reader.js';
import {
  mapProviderToProfile,
  buildProfile,
} from '../../src/core/cc-switch-mappers.js';

describe('import-from-cc-switch integration', () => {
  let tempDir: string;
  let dbPath: string;

  beforeAll(async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'cc-use-test-'));
    dbPath = join(tempDir, 'cc-switch.db');

    const SQL = await initSqlJs();
    const db = new SQL.Database();

    // Create schema matching real cc-switch
    db.run(`
      CREATE TABLE providers (
        id TEXT NOT NULL,
        app_type TEXT NOT NULL,
        name TEXT NOT NULL,
        settings_config TEXT NOT NULL,
        website_url TEXT,
        category TEXT,
        created_at INTEGER,
        sort_index INTEGER,
        notes TEXT,
        icon TEXT,
        icon_color TEXT,
        meta TEXT NOT NULL DEFAULT '{}',
        is_current BOOLEAN NOT NULL DEFAULT 0,
        in_failover_queue BOOLEAN NOT NULL DEFAULT 0,
        provider_type TEXT,
        PRIMARY KEY (id, app_type)
      );
    `);

    db.run(`
      CREATE TABLE provider_endpoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider_id TEXT NOT NULL,
        app_type TEXT NOT NULL,
        url TEXT NOT NULL
      );
    `);

    // Insert test providers
    db.run(`
      INSERT INTO providers (id, app_type, name, settings_config, provider_type)
      VALUES
        ('openrouter-1', 'claude', 'OpenRouter Test', '{"env":{"OPENROUTER_API_KEY":"sk-or-test","OPENROUTER_BASE_URL":"https://openrouter.ai/api/v1"}}', 'openrouter'),
        ('deepseek-1', 'claude', 'DeepSeek Test', '{"env":{"ANTHROPIC_AUTH_TOKEN":"sk-ds-test","ANTHROPIC_BASE_URL":"https://api.deepseek.com/anthropic"}}', 'deepseek'),
        ('gemini-1', 'gemini', 'Gemini Only', '{"env":{"GEMINI_API_KEY":"sk-gem-test"}}', 'gemini');
    `);

    db.run(`
      INSERT INTO provider_endpoints (provider_id, app_type, url)
      VALUES
        ('openrouter-1', 'claude', 'https://openrouter.ai/api/v1'),
        ('deepseek-1', 'claude', 'https://api.deepseek.com/anthropic');
    `);

    const data = db.export();
    const buffer = Buffer.from(data);
    const { writeFileSync } = await import('node:fs');
    writeFileSync(dbPath, buffer);
    db.close();
  });

  afterAll(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should read only claude providers from test db', async () => {
    const providers = await readCcSwitchProviders(dbPath);
    expect(providers).toHaveLength(2);
    expect(providers.map((p) => p.name)).toContain('OpenRouter Test');
    expect(providers.map((p) => p.name)).toContain('DeepSeek Test');
    expect(providers.map((p) => p.name)).not.toContain('Gemini Only');
  });

  it('should extract env from settings_config', async () => {
    const providers = await readCcSwitchProviders(dbPath);
    const openrouter = providers.find((p) => p.name === 'OpenRouter Test');
    expect(openrouter?.env.OPENROUTER_API_KEY).toBe('sk-or-test');
    expect(openrouter?.env.OPENROUTER_BASE_URL).toBe('https://openrouter.ai/api/v1');
  });

  it('should read endpoints', async () => {
    const providers = await readCcSwitchProviders(dbPath);
    const deepseek = providers.find((p) => p.name === 'DeepSeek Test');
    expect(deepseek?.endpoints).toContain('https://api.deepseek.com/anthropic');
  });

  it('should map providers to correct profiles', async () => {
    const providers = await readCcSwitchProviders(dbPath);
    const profiles = providers.map((p) =>
      buildProfile(mapProviderToProfile(p)),
    );

    const openrouter = profiles.find((p) => p.label === 'OpenRouter Test');
    expect(openrouter).toBeDefined();
    expect(openrouter?.preset).toBe('openrouter');
    expect(openrouter?.env.OPENROUTER_API_KEY).toBe('sk-or-test');

    const deepseek = profiles.find((p) => p.label === 'DeepSeek Test');
    expect(deepseek).toBeDefined();
    expect(deepseek?.preset).toBe('deepseek');
    expect(deepseek?.env.ANTHROPIC_AUTH_TOKEN).toBe('sk-ds-test');
  });
});
