import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkGitSafety } from '../../src/core/git-safety.js';

describe('git-safety', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'cc-use-git-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return false when no .gitignore', async () => {
    const result = await checkGitSafety(tempDir);
    expect(result.isIgnored).toBe(false);
  });

  it('should detect .claude/ in .gitignore', async () => {
    writeFileSync(join(tempDir, '.gitignore'), 'node_modules/\n.claude/\n');
    const result = await checkGitSafety(tempDir);
    expect(result.isIgnored).toBe(true);
  });

  it('should return false when .claude/ not in .gitignore', async () => {
    writeFileSync(join(tempDir, '.gitignore'), 'node_modules/\n');
    const result = await checkGitSafety(tempDir);
    expect(result.isIgnored).toBe(false);
  });
});
