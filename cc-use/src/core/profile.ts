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
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as Profile;
  } catch {
    throw new Error(`Profile file corrupted: ${filePath}`);
  }
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

export async function findSimilarProfiles(input: string, candidates: string[]): Promise<string[]> {
  const distances = candidates.map((c) => ({
    name: c,
    distance: levenshteinDistance(input.toLowerCase(), c.toLowerCase()),
  }));
  distances.sort((a, b) => a.distance - b.distance);
  return distances
    .filter((d) => d.distance <= 3 && d.distance > 0)
    .slice(0, 2)
    .map((d) => d.name);
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[b.length][a.length];
}
