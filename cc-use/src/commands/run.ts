import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { useCommand } from './use.js';
import { loadProfile } from '../core/profile.js';
import { loadPreset } from '../core/preset.js';
import { restoreBackup } from '../core/atomic-write.js';
import { printCommandHeader, success, warning } from '../ui/index.js';
import { promptProfileSelectionWithInfo } from './_interactive.js';
import pc from 'picocolors';

export async function runCommand(
  profileLabel: string | undefined,
  claudeArgs: string[] = [],
  cwd: string = process.cwd(),
): Promise<void> {
  let label = profileLabel;
  if (!label) {
    label = await promptProfileSelectionWithInfo('Select a profile to run:');
    if (!label) return;
  }

  const profile = await loadProfile(label);
  const preset = profile ? await loadPreset(profile.preset) : undefined;
  const configFileName = profile?.configFileName || preset?.configFileName || 'settings.json';
  const settingsPath = join(cwd, '.claude', configFileName);
  const backupPath = `${settingsPath}.backup`;

  try {
    await useCommand(label, cwd);

    printCommandHeader('Launch Claude', `Profile: ${label}`);
    console.log(pc.dim('  Starting Claude Code...'));
    console.log();

    const claude = spawn('claude', claudeArgs, {
      stdio: 'inherit',
      cwd,
      shell: true,
    });

    await new Promise<void>((resolve, reject) => {
      claude.on('close', () => resolve());
      claude.on('error', (error) => reject(error));
    });
  } catch (error) {
    if (existsSync(backupPath)) {
      await restoreBackup(settingsPath, backupPath);
      warning(`Restored previous ${configFileName}`);
    }
    throw error;
  }
}
