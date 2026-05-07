import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import type { Metadata } from './types.js';
import { atomicWrite } from './atomic-write.js';

const METADATA_FILE = '.claude/cc-use.json';

export async function readMetadata(cwd: string = process.cwd()): Promise<Metadata | undefined> {
  const filePath = join(cwd, METADATA_FILE);
  if (!existsSync(filePath)) {
    return undefined;
  }
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as Metadata;
  } catch {
    console.warn(`Warning: ${filePath} is corrupted, will regenerate`);
    return undefined;
  }
}

export async function writeMetadata(metadata: Metadata, cwd: string = process.cwd()): Promise<void> {
  const filePath = join(cwd, METADATA_FILE);
  const content = JSON.stringify(metadata, null, 2);
  await atomicWrite(filePath, content);
}

export function createMetadata(
  profile: { label: string; preset: string; presetVersion: number },
  envKeys: string[],
  configFileName: string = 'settings.json',
  hasOriginalBackup: boolean = false,
): Metadata {
  return {
    version: 1,
    profile: profile.label,
    preset: profile.preset,
    presetVersion: profile.presetVersion,
    updatedAt: new Date().toISOString(),
    profileChecksum: computeChecksum(profile),
    lastManagedEnvKeys: envKeys,
    configFileName,
    hasOriginalBackup,
  };
}

function computeChecksum(data: unknown): string {
  const str = JSON.stringify(data);
  return createHash('sha256').update(str).digest('hex');
}
