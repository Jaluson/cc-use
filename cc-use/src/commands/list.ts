import { listProfiles } from '../core/profile.js';
import pc from 'picocolors';

export async function listCommand(): Promise<void> {
  const profiles = await listProfiles();
  if (profiles.length === 0) {
    console.log(pc.yellow('No profiles found'));
    return;
  }
  console.log(pc.bold('Profiles:'));
  for (const name of profiles) {
    console.log(`  ${name}`);
  }
}
