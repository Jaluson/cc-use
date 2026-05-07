import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import pc from 'picocolors';
import { useCommand } from './use.js';
import { loadProfile } from '../core/profile.js';
import { loadPreset } from '../core/preset.js';
import { restoreBackup } from '../core/atomic-write.js';

export async function runCommand(
  profileLabel: string,
  claudeArgs: string[] = [],
  cwd: string = process.cwd(),
): Promise<void> {
  const profile = await loadProfile(profileLabel);
  const preset = profile ? await loadPreset(profile.preset) : undefined;
  const configFileName = profile?.configFileName || preset?.configFileName || 'settings.json';
  const settingsPath = join(cwd, '.claude', configFileName);
  const backupPath = `${settingsPath}.backup`;

  try {
    await useCommand(profileLabel, cwd);

    console.log(pc.blue('Launching Claude...'));
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
      console.log(pc.yellow(`✓ Restored previous ${configFileName}`));
    }
    throw error;
  }
}
