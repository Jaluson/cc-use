import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface GitSafetyResult {
  isIgnored: boolean;
  gitignorePath?: string;
}

export async function checkGitSafety(cwd: string = process.cwd()): Promise<GitSafetyResult> {
  const gitignorePath = join(cwd, '.gitignore');

  if (!existsSync(gitignorePath)) {
    return { isIgnored: false };
  }

  const content = await readFile(gitignorePath, 'utf-8');
  const lines = content.split('\n');
  const isIgnored = lines.some((line) => {
    const trimmed = line.trim();
    return trimmed === '.claude/' || trimmed === '.claude' || trimmed === '.claude/*';
  });

  return { isIgnored, gitignorePath };
}
