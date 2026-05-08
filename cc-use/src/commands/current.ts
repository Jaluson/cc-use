import { readMetadata } from '../core/metadata.js';
import { printCommandHeader, printKeyValue, printEmptyState } from '../ui/index.js';

export async function currentCommand(): Promise<void> {
  const meta = await readMetadata();
  if (!meta) {
    printEmptyState(
      'No active profile in current project',
      'Use "cc-use use <profile>" to activate a profile',
    );
    return;
  }

  printCommandHeader('Current Profile');

  printKeyValue([
    { key: 'Profile', value: meta.profile },
    { key: 'Preset', value: meta.preset },
    { key: 'Config File', value: meta.configFileName || 'settings.json' },
    { key: 'Managed Keys', value: String(meta.lastManagedEnvKeys.length) },
    { key: 'Updated', value: meta.updatedAt },
  ]);

  console.log();
}
