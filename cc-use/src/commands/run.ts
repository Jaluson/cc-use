import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import pc from 'picocolors';
import { useCommand } from './use.js';
import { restoreBackup } from '../core/atomic-write.js';

export async function runCommand(
  profileLabel: string,
  claudeArgs: string[] = [],
  cwd: string = process.cwd(),
): Promise<void> {
  const settingsPath = join(cwd, '.claude', 'settings.json');
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
      console.log(pc.yellow('✓ Restored previous settings.json'));
    }
    throw error;
  }
}
