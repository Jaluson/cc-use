import prompts from 'prompts';
import pc from 'picocolors';
import { listProfiles, loadProfile } from '../core/profile.js';
import { loadPreset } from '../core/preset.js';
import { printEmptyState, s } from '../ui/index.js';

/**
 * Prompt user to select a profile interactively.
 * Returns the selected profile label, or undefined if cancelled.
 */
export async function promptProfileSelection(message = 'Select a profile:'): Promise<string | undefined> {
  const profiles = await listProfiles();
  if (profiles.length === 0) {
    printEmptyState('No profiles found', 'Use "cc-use add" to create your first profile');
    return undefined;
  }

  const { selected } = await prompts({
    type: 'select',
    name: 'selected',
    message,
    choices: profiles.map((p) => {
      const label = p;
      return { title: label, value: p };
    }),
  });

  if (!selected) {
    console.log(pc.yellow(`${s.warning} Cancelled`));
    return undefined;
  }

  return selected as string;
}

/**
 * Prompt user to select a profile with preset info displayed.
 */
export async function promptProfileSelectionWithInfo(message = 'Select a profile:'): Promise<string | undefined> {
  const profileNames = await listProfiles();
  if (profileNames.length === 0) {
    printEmptyState('No profiles found', 'Use "cc-use add" to create your first profile');
    return undefined;
  }

  const profiles = await Promise.all(
    profileNames.map(async (name) => {
      const profile = await loadProfile(name);
      const preset = profile ? await loadPreset(profile.preset) : undefined;
      return { name, profile, preset };
    }),
  );

  const { selected } = await prompts({
    type: 'select',
    name: 'selected',
    message,
    choices: profiles.map((p) => {
      const presetLabel = p.preset ? pc.dim(`(${p.preset.label})`) : pc.dim('(unknown)');
      return { title: `${p.name} ${presetLabel}`, value: p.name };
    }),
  });

  if (!selected) {
    console.log(pc.yellow(`${s.warning} Cancelled`));
    return undefined;
  }

  return selected as string;
}

/**
 * Prompt for confirmation before destructive operation.
 */
export async function promptConfirm(message: string, defaultNo = true): Promise<boolean> {
  const { confirmed } = await prompts({
    type: 'select',
    name: 'confirmed',
    message,
    choices: [
      { title: defaultNo ? 'No' : pc.red('Yes, proceed'), value: false },
      { title: defaultNo ? pc.red('Yes, proceed') : 'No', value: true },
    ],
    initial: defaultNo ? 0 : 1,
  });

  return confirmed === true;
}
