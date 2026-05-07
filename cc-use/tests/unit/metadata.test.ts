import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readMetadata, writeMetadata, createMetadata } from '../../src/core/metadata.js';

describe('metadata', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'cc-use-meta-'));
    mkdirSync(join(tempDir, '.claude'), { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return undefined when metadata does not exist', async () => {
    const meta = await readMetadata(tempDir);
    expect(meta).toBeUndefined();
  });

  it('should write and read metadata', async () => {
    const meta = createMetadata(
      { label: 'my-kimi', preset: 'kimi', presetVersion: 1 },
      ['ANTHROPIC_MODEL'],
    );
    await writeMetadata(meta, tempDir);
    const read = await readMetadata(tempDir);
    expect(read).toBeDefined();
    expect(read?.profile).toBe('my-kimi');
    expect(read?.lastManagedEnvKeys).toEqual(['ANTHROPIC_MODEL']);
  });

  it('should generate stable checksum', () => {
    const a = createMetadata({ label: 'test', preset: 'kimi', presetVersion: 1 }, []);
    const b = createMetadata({ label: 'test', preset: 'kimi', presetVersion: 1 }, []);
    expect(a.profileChecksum).toBe(b.profileChecksum);
  });
});
