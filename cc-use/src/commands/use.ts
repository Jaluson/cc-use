import { existsSync } from 'node:fs';
import { mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import pc from 'picocolors';
import { loadProfile, listProfiles, findSimilarProfiles } from '../core/profile.js';
import { loadPreset } from '../core/preset.js';
import { renderSettings } from '../core/renderer.js';
import { atomicWrite, cleanupBackup } from '../core/atomic-write.js';
import { createMetadata, writeMetadata, readMetadata } from '../core/metadata.js';
import { checkGitSafety } from '../core/git-safety.js';
import { printCommandHeader, success, warning, printBox, printKeyValue, s } from '../ui/index.js';

export interface UseOptions {
  dryRun?: boolean;
}

export async function useCommand(
  profileLabel: string,
  cwd: string = process.cwd(),
  options: UseOptions = {},
): Promise<void> {
  const profile = await loadProfile(profileLabel);
  if (!profile) {
    const candidates = await listProfiles();
    const similar = await findSimilarProfiles(profileLabel, candidates);
    let msg = `Profile "${profileLabel}" not found`;
    if (similar.length > 0) {
      msg += `\nDid you mean: ${similar.join(', ')}?`;
    }
    throw new Error(msg);
  }

  const preset = await loadPreset(profile.preset);
  if (!preset) {
    throw new Error(`Preset "${profile.preset}" not found`);
  }

  const claudeDir = join(cwd, '.claude');
  if (!existsSync(claudeDir)) {
    await mkdir(claudeDir, { recursive: true });
  }

  const configFileName = profile.configFileName || preset.configFileName || 'settings.json';
  const settingsPath = join(claudeDir, configFileName);

  // Save original backup on first use
  const originalPath = `${settingsPath}.original`;
  const metadata = await readMetadata(cwd);
  const isFirstUse = !metadata;
  if (isFirstUse && existsSync(settingsPath) && !existsSync(originalPath)) {
    await copyFile(settingsPath, originalPath);
  }

  const { settings, managedEnvKeys } = await renderSettings(profile, preset, cwd, configFileName);

  if (options.dryRun) {
    printCommandHeader('Dry Run', `Profile: ${profileLabel}`);
    console.log(JSON.stringify(settings, null, 2));
    console.log();
    return;
  }

  const settingsContent = JSON.stringify(settings, null, 2);
  const result = await atomicWrite(settingsPath, settingsContent);

  const meta = createMetadata(
    profile,
    managedEnvKeys,
    configFileName,
    isFirstUse || metadata?.hasOriginalBackup || false,
  );
  await writeMetadata(meta, cwd);

  if (result.backupPath) {
    await cleanupBackup(result.backupPath);
  }

  printCommandHeader('Profile Applied', profileLabel);

  printKeyValue([
    { key: 'Preset', value: preset.label },
    { key: 'Config File', value: `.claude/${configFileName}` },
    { key: 'Managed Keys', value: String(managedEnvKeys.length) },
  ]);

  const gitSafety = await checkGitSafety(cwd);
  if (!gitSafety.isIgnored) {
    console.log();
    printBox(
      [
        pc.yellow(`${s.warning} .claude/${configFileName} contains credentials`),
        pc.yellow(`${s.warning} .claude/ is not ignored by git`),
      ],
      { borderColor: pc.yellow },
    );
  }

  console.log();
  success(`Profile "${profileLabel}" is now active`);
  console.log(pc.dim(`  Run "claude" to start with this configuration`));
  console.log();
}
