import { existsSync, readFileSync } from 'node:fs';
import { unlink, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import pc from 'picocolors';
import type { Metadata, SettingsJson } from '../core/types.js';
import { printCommandHeader, success, warning, printBox, s } from '../ui/index.js';
import { promptConfirm } from './_interactive.js';

export async function rollbackCommand(cwd: string = process.cwd()): Promise<void> {
  const claudeDir = join(cwd, '.claude');
  const metadataPath = join(claudeDir, 'cc-use.json');

  if (!existsSync(metadataPath)) {
    printBox([pc.yellow('No cc-use managed config found in current project')], { borderColor: pc.yellow });
    return;
  }

  let meta: Metadata;
  try {
    meta = JSON.parse(readFileSync(metadataPath, 'utf-8'));
  } catch {
    printBox(
      [
        pc.red('Error: Metadata file corrupted, cannot rollback safely'),
        pc.yellow('You may manually check .claude/settings.json'),
      ],
      { borderColor: pc.red },
    );
    return;
  }

  printCommandHeader('Rollback', `Profile: ${meta.profile}`);

  const confirmed = await promptConfirm('Rollback will restore previous settings. Continue?', true);
  if (!confirmed) {
    console.log(pc.yellow(`${s.warning} Cancelled`));
    return;
  }

  const configFileName = meta.configFileName || 'settings.json';
  const settingsPath = join(claudeDir, configFileName);
  const originalPath = `${settingsPath}.original`;
  const backupPath = `${settingsPath}.backup`;

  let restored = false;

  // Priority 1: restore original backup
  if (existsSync(originalPath)) {
    await copyFile(originalPath, settingsPath);
    success(`Rolled back to original ${configFileName}`);
    restored = true;
  }
  // Priority 2: restore recent backup
  else if (existsSync(backupPath)) {
    await copyFile(backupPath, settingsPath);
    await unlink(backupPath);
    success(`Rolled back to previous ${configFileName}`);
    restored = true;
  }
  // Priority 3: remove managed keys
  else if (existsSync(settingsPath) && meta.lastManagedEnvKeys.length > 0) {
    const settings: SettingsJson = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    if (settings.env) {
      for (const key of meta.lastManagedEnvKeys) {
        delete settings.env[key];
      }
      const { atomicWrite } = await import('../core/atomic-write.js');
      await atomicWrite(settingsPath, JSON.stringify(settings, null, 2));
      success(`Removed ${meta.lastManagedEnvKeys.length} managed env keys from ${configFileName}`);
      restored = true;
    }
  }

  if (!restored) {
    warning('Nothing to restore');
  }

  // Remove metadata
  await unlink(metadataPath);
  success(`Removed cc-use metadata`);
  console.log();
}

// Backward compatibility alias
export { rollbackCommand as cleanCommand };
