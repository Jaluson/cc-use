import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderSettings } from '../../src/core/renderer.js';
import type { Profile, Preset } from '../../src/core/types.js';

describe('renderer', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'cc-use-render-'));
    mkdirSync(join(tempDir, '.claude'), { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  const preset: Preset = {
    version: 1,
    id: 'kimi',
    label: 'Kimi',
    capabilities: {},
    modelRoles: ['default'],
    modelEnvMapping: { default: 'ANTHROPIC_MODEL' },
    env: { ANTHROPIC_BASE_URL: { value: 'https://api.kimi.com' } },
    providerRuntimeSettings: { includeCoAuthoredBy: false },
  };

  const profile: Profile = {
    version: 1,
    preset: 'kimi',
    presetVersion: 1,
    label: 'my-kimi',
    env: { ANTHROPIC_MODEL: 'kimi-for-coding' },
  };

  it('should render settings from scratch', async () => {
    const result = await renderSettings(profile, preset, tempDir);
    expect(result.settings.env?.ANTHROPIC_MODEL).toBe('kimi-for-coding');
    expect(result.settings.includeCoAuthoredBy).toBe(false);
    expect(result.managedEnvKeys).toEqual(['ANTHROPIC_MODEL']);
  });

  it('should preserve unmanaged user settings', async () => {
    writeFileSync(
      join(tempDir, '.claude/settings.json'),
      JSON.stringify({ hooks: { preCommand: 'echo hello' }, env: { USER_VAR: 'value' } }),
    );
    const result = await renderSettings(profile, preset, tempDir);
    expect(result.settings.hooks).toEqual({ preCommand: 'echo hello' });
    expect(result.settings.env?.USER_VAR).toBe('value');
  });

  it('should cleanup old managed keys', async () => {
    writeFileSync(
      join(tempDir, '.claude/settings.json'),
      JSON.stringify({ env: { OLD_KEY: 'old' } }),
    );
    writeFileSync(
      join(tempDir, '.claude/cc-use.json'),
      JSON.stringify({ lastManagedEnvKeys: ['OLD_KEY'] }),
    );
    const result = await renderSettings(profile, preset, tempDir);
    expect(result.settings.env?.OLD_KEY).toBeUndefined();
    expect(result.settings.env?.ANTHROPIC_MODEL).toBe('kimi-for-coding');
  });
});
