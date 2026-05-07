import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import type { Profile } from './types.js';
import { getConfigPaths } from './config-paths.js';

function getProfilePath(label: string): string {
  const paths = getConfigPaths();
  return join(paths.profiles, `${label}.json`);
}

export async function saveProfile(profile: Profile, oldLabel?: string): Promise<void> {
  const paths = getConfigPaths();
  if (!existsSync(paths.profiles)) {
    await mkdir(paths.profiles, { recursive: true });
  }
  const filePath = getProfilePath(profile.label);
  await writeFile(filePath, JSON.stringify(profile, null, 2), 'utf-8');

  // If label changed, remove the old file
  if (oldLabel && oldLabel !== profile.label) {
    const oldPath = getProfilePath(oldLabel);
    if (existsSync(oldPath)) {
      await unlink(oldPath);
    }
  }
}

export async function loadProfile(label: string): Promise<Profile | undefined> {
  const filePath = getProfilePath(label);
  if (!existsSync(filePath)) {
    return undefined;
  }
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as Profile;
}

export async function deleteProfile(label: string): Promise<boolean> {
  const filePath = getProfilePath(label);
  if (!existsSync(filePath)) {
    return false;
  }
  await unlink(filePath);
  return true;
}

export async function listProfiles(): Promise<string[]> {
  const paths = getConfigPaths();
  if (!existsSync(paths.profiles)) {
    return [];
  }
  const files = await readdir(paths.profiles);
  return files
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));
}

export async function profileExists(label: string): Promise<boolean> {
  return existsSync(getProfilePath(label));
}
