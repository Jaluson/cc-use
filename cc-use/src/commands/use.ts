import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import pc from 'picocolors';
import { loadProfile } from '../core/profile.js';
import { loadPreset } from '../core/preset.js';
import { renderSettings } from '../core/renderer.js';
import { atomicWrite, cleanupBackup } from '../core/atomic-write.js';
import { createMetadata, writeMetadata } from '../core/metadata.js';
import { checkGitSafety } from '../core/git-safety.js';

export async function useCommand(profileLabel: string, cwd: string = process.cwd()): Promise<void> {
  const profile = await loadProfile(profileLabel);
  if (!profile) {
    throw new Error(`Profile "${profileLabel}" not found`);
  }

  const preset = await loadPreset(profile.preset);
  if (!preset) {
    throw new Error(`Preset "${profile.preset}" not found`);
  }

  const claudeDir = join(cwd, '.claude');
  if (!existsSync(claudeDir)) {
    await mkdir(claudeDir, { recursive: true });
  }

  const { settings, managedEnvKeys } = await renderSettings(profile, preset, cwd);
  const settingsContent = JSON.stringify(settings, null, 2);

  const settingsPath = join(claudeDir, 'settings.json');
  const result = await atomicWrite(settingsPath, settingsContent);

  const metadata = createMetadata(profile, managedEnvKeys);
  await writeMetadata(metadata, cwd);

  if (result.backupPath) {
    await cleanupBackup(result.backupPath);
  }

  const gitSafety = await checkGitSafety(cwd);
  if (!gitSafety.isIgnored) {
    console.log(pc.yellow('⚠ .claude/settings.json contains credentials'));
    console.log(pc.yellow('⚠ .claude/ is not ignored by git'));
  }

  console.log(pc.green(`✓ Profile "${profileLabel}" applied`));
}
