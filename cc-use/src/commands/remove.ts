import { deleteProfile } from '../core/profile.js';
import pc from 'picocolors';

export async function removeCommand(profileLabels: string[]): Promise<void> {
  for (const label of profileLabels) {
    const success = await deleteProfile(label);
    if (success) {
      console.log(pc.green(`✓ Profile "${label}" removed`));
    } else {
      console.log(pc.yellow(`⚠ Profile "${label}" not found`));
    }
  }
}
