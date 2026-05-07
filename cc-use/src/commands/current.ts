import { readMetadata } from '../core/metadata.js';
import pc from 'picocolors';

export async function currentCommand(): Promise<void> {
  const meta = await readMetadata();
  if (!meta) {
    console.log(pc.yellow('No active profile in current project'));
    return;
  }
  console.log(pc.bold('Current profile:'));
  console.log(`  Profile: ${meta.profile}`);
  console.log(`  Preset: ${meta.preset}`);
  console.log(`  Updated: ${meta.updatedAt}`);
}
