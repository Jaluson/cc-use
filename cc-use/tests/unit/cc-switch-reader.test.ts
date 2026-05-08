import { describe, it, expect } from 'vitest';
import { getCcSwitchDbPath } from '../../src/core/cc-switch-reader.js';
import { homedir } from 'node:os';
import { join } from 'node:path';

describe('cc-switch-reader', () => {
  it('should resolve db path to home directory', () => {
    const path = getCcSwitchDbPath();
    expect(path).toBe(join(homedir(), '.cc-switch', 'cc-switch.db'));
  });

  it('should throw when db does not exist', async () => {
    const { readCcSwitchProviders } = await import(
      '../../src/core/cc-switch-reader.js'
    );
    await expect(
      readCcSwitchProviders('/nonexistent/path/cc-switch.db'),
    ).rejects.toThrow('未找到 cc-switch 数据库');
  });
});
