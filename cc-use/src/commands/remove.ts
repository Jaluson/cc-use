import { deleteProfile, listProfiles } from '../core/profile.js';
import prompts from 'prompts';
import { printCommandHeader, success, warning, printBox, s } from '../ui/index.js';
import pc from 'picocolors';

export async function removeCommand(profileLabels: string[]): Promise<void> {
  let targets = profileLabels;

  // Interactive mode when no profiles specified
  if (targets.length === 0) {
    const allProfiles = await listProfiles();
    if (allProfiles.length === 0) {
      printBox([pc.yellow('No profiles to remove')], { borderColor: pc.yellow });
      return;
    }

    printCommandHeader('Remove Profiles', `${allProfiles.length} profile(s) available`);

    // Ask action mode first
    const modeResponse = await prompts({
      type: 'select',
      name: 'mode',
      message: 'Select action:',
      choices: [
        { title: 'Select multiple', value: 'select' },
        { title: 'Remove all', value: 'all' },
      ],
    });

    if (!modeResponse.mode) {
      warning('Cancelled');
      return;
    }

    if (modeResponse.mode === 'all') {
      targets = allProfiles;
    } else {
      const { selected } = await prompts({
        type: 'multiselect',
        name: 'selected',
        message: 'Select profiles to remove (Space to toggle, Enter to confirm):',
        choices: allProfiles.map((name) => ({ title: name, value: name, selected: false })),
        hint: '- Space to select. Return to submit',
      });

      if (!selected || selected.length === 0) {
        warning('Cancelled');
        return;
      }

      targets = selected as string[];
    }

    // Secondary confirmation
    console.log();
    console.log(pc.yellow(pc.bold(`${s.warning} The following profiles will be removed:`)));
    for (const name of targets) {
      console.log(pc.yellow(`  ${s.bullet} ${name}`));
    }
    console.log();

    const confirmResponse = await prompts({
      type: 'select',
      name: 'action',
      message: 'Please confirm:',
      choices: [
        { title: 'Cancel', value: 'cancel' },
        { title: pc.red('Confirm removal'), value: 'confirm' },
      ],
      initial: 0,
    });

    if (!confirmResponse.action || confirmResponse.action === 'cancel') {
      warning('Cancelled');
      return;
    }
  }

  console.log();
  let removed = 0;
  for (const label of targets) {
    const successDel = await deleteProfile(label);
    if (successDel) {
      success(`Profile "${label}" removed`);
      removed++;
    } else {
      warning(`Profile "${label}" not found`);
    }
  }

  if (removed > 0) {
    console.log();
    console.log(pc.dim(`  ${removed} profile(s) removed`));
  }
  console.log();
}
