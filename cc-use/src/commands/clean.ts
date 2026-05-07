import { existsSync, readFileSync } from 'node:fs';
import { unlink, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import pc from 'picocolors';
import type { Metadata, SettingsJson } from '../core/types.js';

export async function cleanCommand(cwd: string = process.cwd()): Promise<void> {
  const claudeDir = join(cwd, '.claude');
  const metadataPath = join(claudeDir, 'cc-use.json');
  const settingsPath = join(claudeDir, 'settings.json');
  const backupPath = `${settingsPath}.backup`;

  // Check if metadata exists
  if (!existsSync(metadataPath)) {
    console.log(pc.yellow('No cc-use managed config found in current project'));
    return;
  }

  // Read metadata to get managed keys
  const meta: Metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));

  // Restore backup if exists
  if (existsSync(backupPath)) {
    await copyFile(backupPath, settingsPath);
    await unlink(backupPath);
    console.log(pc.green('✓ Restored previous settings.json from backup'));
  } else if (existsSync(settingsPath) && meta.lastManagedEnvKeys.length > 0) {
    // No backup: remove managed env keys from settings.json
    const settings: SettingsJson = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    if (settings.env) {
      for (const key of meta.lastManagedEnvKeys) {
        delete settings.env[key];
      }
      // Write back
      const { atomicWrite } = await import('../core/atomic-write.js');
      await atomicWrite(settingsPath, JSON.stringify(settings, null, 2));
      console.log(pc.green(`✓ Removed ${meta.lastManagedEnvKeys.length} managed env keys from settings.json`));
    }
  }

  // Remove metadata
  await unlink(metadataPath);
  console.log(pc.green(`✓ Removed cc-use metadata (profile: ${meta.profile})`));
}
