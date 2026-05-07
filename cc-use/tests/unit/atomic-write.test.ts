import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { atomicWrite, restoreBackup, cleanupBackup } from '../../src/core/atomic-write.js';

describe('atomic-write', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'cc-use-aw-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should write new file atomically', async () => {
    const filePath = join(tempDir, 'test.json');
    const result = await atomicWrite(filePath, '{"key": "value"}');
    expect(result.success).toBe(true);
    expect(existsSync(filePath)).toBe(true);
    expect(readFileSync(filePath, 'utf-8')).toBe('{"key": "value"}');
  });

  it('should create backup for existing file', async () => {
    const filePath = join(tempDir, 'test.json');
    writeFileSync(filePath, 'old content');
    const result = await atomicWrite(filePath, 'new content');
    expect(result.backupPath).toBeTruthy();
    expect(existsSync(result.backupPath!)).toBe(true);
  });

  it('should restore backup', async () => {
    const filePath = join(tempDir, 'test.json');
    writeFileSync(filePath, 'original');
    const backupPath = join(tempDir, 'test.json.backup');
    writeFileSync(backupPath, 'backup content');
    await restoreBackup(filePath, backupPath);
    expect(readFileSync(filePath, 'utf-8')).toBe('backup content');
    expect(existsSync(backupPath)).toBe(false);
  });

  it('should cleanup backup', async () => {
    const backupPath = join(tempDir, 'test.json.backup');
    writeFileSync(backupPath, 'backup');
    await cleanupBackup(backupPath);
    expect(existsSync(backupPath)).toBe(false);
  });
});
