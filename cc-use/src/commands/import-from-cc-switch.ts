import prompts from 'prompts';
import { readCcSwitchProviders } from '../core/cc-switch-reader.js';
import {
  mapProviderToProfile,
  buildProfile,
} from '../core/cc-switch-mappers.js';
import {
  saveProfile,
  listProfiles,
  profileExists,
} from '../core/profile.js';
import { printCommandHeader, success, warning, printTable, s } from '../ui/index.js';
import pc from 'picocolors';

export interface ImportOptions {
  dryRun?: boolean;
}

export async function importFromCcSwitchCommand(
  options: ImportOptions = {},
): Promise<void> {
  const providers = await readCcSwitchProviders();

  if (providers.length === 0) {
    warning('No Claude Code providers found');
    return;
  }

  // Map providers to profiles
  const mapped = providers.map((p) => ({
    provider: p,
    profile: buildProfile(mapProviderToProfile(p)),
  }));

  printCommandHeader('Import from CC Switch', `${providers.length} provider(s) found`);

  // Show preview
  printTable(
    [
      { key: 'label', header: 'Profile', width: 20 },
      { key: 'preset', header: 'Preset', width: 16 },
    ],
    mapped.map((m) => ({
      label: pc.white(m.profile.label),
      preset: pc.cyan(m.profile.preset),
    })),
    { compact: true },
  );

  if (options.dryRun) {
    console.log();
    console.log(pc.blue(`${s.info} Preview — profiles to be imported:`));
    console.log(JSON.stringify(mapped.map((m) => m.profile), null, 2));
    console.log();
    return;
  }

  // Ask import mode
  const modeResponse = await prompts({
    type: 'select',
    name: 'mode',
    message: 'Select import mode:',
    choices: [
      { title: 'Import all', value: 'all' },
      { title: 'Confirm one by one', value: 'confirm' },
    ],
  });
  if (!modeResponse.mode) {
    warning('Cancelled');
    return;
  }
  const mode = modeResponse.mode as 'all' | 'confirm';

  let imported = 0;
  let skipped = 0;

  for (const item of mapped) {
    const { profile } = item;
    const exists = await profileExists(profile.label);

    if (mode === 'confirm') {
      const confirmResponse = await prompts({
        type: 'select',
        name: 'action',
        message: `Import "${profile.label}" (${profile.preset})?`,
        choices: [
          { title: 'Import', value: 'import' },
          { title: 'Skip', value: 'skip' },
        ],
      });
      if (!confirmResponse.action || confirmResponse.action === 'skip') {
        skipped++;
        continue;
      }
    }

    if (exists) {
      const actionResponse = await prompts({
        type: 'select',
        name: 'action',
        message: `Profile "${profile.label}" already exists:`,
        choices: [
          { title: 'Overwrite', value: 'overwrite' },
          { title: 'Skip', value: 'skip' },
          { title: 'Rename', value: 'rename' },
        ],
      });

      if (!actionResponse.action || actionResponse.action === 'skip') {
        skipped++;
        continue;
      }

      if (actionResponse.action === 'rename') {
        const nameResponse = await prompts({
          type: 'text',
          name: 'newName',
          message: 'New name:',
          validate: (value: string) =>
            value.trim().length > 0 ? true : 'Name cannot be empty',
        });
        if (!nameResponse.newName) {
          skipped++;
          continue;
        }
        profile.label = nameResponse.newName.trim();
      }
    }

    await saveProfile(profile);
    success(`Imported "${profile.label}"`);
    imported++;
  }

  console.log();
  console.log(pc.dim(`  Imported: ${imported}, Skipped: ${skipped}`));
  console.log();
}
