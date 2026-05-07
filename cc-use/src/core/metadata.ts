import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Metadata } from './types.js';
import { atomicWrite } from './atomic-write.js';

const METADATA_FILE = '.claude/cc-use.json';

export async function readMetadata(cwd: string = process.cwd()): Promise<Metadata | undefined> {
  const filePath = join(cwd, METADATA_FILE);
  if (!existsSync(filePath)) {
    return undefined;
  }
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as Metadata;
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
  };
}

function computeChecksum(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `sha256:${Math.abs(hash).toString(16)}`;
}
