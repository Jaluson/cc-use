import { existsSync, readFileSync } from 'node:fs';
import { unlink, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import pc from 'picocolors';
import type { Metadata, SettingsJson } from '../core/types.js';

export async function rollbackCommand(cwd: string = process.cwd()): Promise<void> {
  const claudeDir = join(cwd, '.claude');
  const metadataPath = join(claudeDir, 'cc-use.json');

  if (!existsSync(metadataPath)) {
    console.log(pc.yellow('No cc-use managed config found in current project'));
    return;
  }

  let meta: Metadata;
  try {
    meta = JSON.parse(readFileSync(metadataPath, 'utf-8'));
  } catch {
    console.log(pc.red('Error: Metadata file corrupted, cannot rollback safely'));
    console.log(pc.yellow('You may manually check .claude/settings.json'));
    return;
  }

  const configFileName = meta.configFileName || 'settings.json';
  const settingsPath = join(claudeDir, configFileName);
  const originalPath = `${settingsPath}.original`;
  const backupPath = `${settingsPath}.backup`;

  // Priority 1: restore original backup
  if (existsSync(originalPath)) {
    await copyFile(originalPath, settingsPath);
    console.log(pc.green(`✓ Rolled back to original ${configFileName}`));
  }
  // Priority 2: restore recent backup
  else if (existsSync(backupPath)) {
    await copyFile(backupPath, settingsPath);
    await unlink(backupPath);
    console.log(pc.green(`✓ Rolled back to previous ${configFileName}`));
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
      console.log(pc.green(`✓ Removed ${meta.lastManagedEnvKeys.length} managed env keys from ${configFileName}`));
    }
  }

  // Remove metadata
  await unlink(metadataPath);
  console.log(pc.green(`✓ Removed cc-use metadata (profile: ${meta.profile})`));
}

// Backward compatibility alias
export { rollbackCommand as cleanCommand };
