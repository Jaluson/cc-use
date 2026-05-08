import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const cli = join(process.cwd(), 'dist', 'index.js');

describe('CLI integration', () => {
  it('should show help', () => {
    const output = execSync(`node "${cli}" --help`, { encoding: 'utf-8' });
    expect(output).toContain('cc-use');
    expect(output).toContain('add');
    expect(output).toContain('run');
    expect(output).toContain('use');
  });

  it('should show version', () => {
    const output = execSync(`node "${cli}" --version`, { encoding: 'utf-8' });
    expect(output).toContain('0.1.3');
  });

  it('should list presets', () => {
    const output = execSync(`node "${cli}" preset-list`, { encoding: 'utf-8' });
    expect(output).toContain('kimi');
    expect(output).toContain('openrouter');
    expect(output).toContain('anthropic');
  });

  it('should list profiles without error', () => {
    const output = execSync(`node "${cli}" list`, { encoding: 'utf-8' });
    // May contain profiles or "No profiles found"
    expect(output).toBeTruthy();
  });

  it('should error on missing profile for show', () => {
    expect(() => {
      execSync(`node "${cli}" show nonexistent`, { encoding: 'utf-8', stdio: 'pipe' });
    }).toThrow();
  });
});
