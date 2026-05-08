import { deleteProfile, listProfiles } from '../core/profile.js';
import pc from 'picocolors';
import prompts from 'prompts';
import Enquirer from 'enquirer';

const { MultiSelect } = Enquirer as any;

export async function removeCommand(profileLabels: string[]): Promise<void> {
  let targets = profileLabels;

  // Interactive mode when no profiles specified
  if (targets.length === 0) {
    const allProfiles = await listProfiles();
    if (allProfiles.length === 0) {
      console.log(pc.yellow('No profiles to remove'));
      return;
    }

    // Ask action mode first
    const modeResponse = await prompts({
      type: 'select',
      name: 'mode',
      message: 'Select action',
      choices: [
        { title: 'Manual select (↑↓ move, space toggle, enter confirm)', value: 'manual' },
        { title: 'Select all', value: 'all' },
      ],
    });

    if (!modeResponse.mode) {
      console.log(pc.yellow('Cancelled'));
      return;
    }

    if (modeResponse.mode === 'all') {
      targets = allProfiles;
    } else {
      const choices = allProfiles.map((name: string) => ({ name, message: name, value: name }));

      const prompt = new MultiSelect({
        name: 'selected',
        message: 'Select profiles to remove',
        choices,
        limit: 5,
        hint: '↑↓ move, space toggle, a all, c current page, ← → page, enter confirm',
        c(this: any) {
          const visible = this.visible;
          const allEnabled = visible.every((ch: any) => ch.disabled || ch.enabled);
          for (const ch of visible) {
            if (!ch.disabled) {
              this.toggle(ch, !allEnabled);
            }
          }
          return this.render();
        },
        left(this: any) {
          for (let i = 0; i < this.limit; i++) {
            this.up();
          }
          return this.render();
        },
        right(this: any) {
          for (let i = 0; i < this.limit; i++) {
            this.down();
          }
          return this.render();
        },
      });

      let selected: string[];
      try {
        selected = await prompt.run();
      } catch {
        console.log(pc.yellow('Cancelled'));
        return;
      }

      if (!selected || selected.length === 0) {
        console.log(pc.yellow('Cancelled'));
        return;
      }

      targets = selected;
    }

    // Secondary confirmation with explicit options
    console.log(pc.yellow('\nThe following profiles will be removed:'));
    for (const name of targets) {
      console.log(`  - ${name}`);
    }
    const confirmResponse = await prompts({
      type: 'select',
      name: 'action',
      message: 'Please confirm',
      choices: [
        { title: 'Confirm removal', value: 'confirm' },
        { title: 'Cancel', value: 'cancel' },
      ],
    });

    if (!confirmResponse.action || confirmResponse.action === 'cancel') {
      console.log(pc.yellow('Cancelled'));
      return;
    }
  }

  for (const label of targets) {
    const success = await deleteProfile(label);
    if (success) {
      console.log(pc.green(`✓ Profile "${label}" removed`));
    } else {
      console.log(pc.yellow(`⚠ Profile "${label}" not found`));
    }
  }
}
