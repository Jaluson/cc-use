import prompts from 'prompts';
import ora from 'ora';
import { loadProfile, saveProfile, profileExists } from '../core/profile.js';
import { loadPreset } from '../core/preset.js';
import { discoverModels } from '../core/model-discovery.js';
import { printCommandHeader, success, warning, s } from '../ui/index.js';
import { promptProfileSelectionWithInfo } from './_interactive.js';
import pc from 'picocolors';
import type { Preset } from '../core/types.js';

export async function editCommand(profileLabel: string | undefined): Promise<void> {
  let label = profileLabel;
  if (!label) {
    label = await promptProfileSelectionWithInfo('Select a profile to edit:');
    if (!label) return;
  }

  const profile = await loadProfile(label);
  if (!profile) {
    throw new Error(`Profile "${label}" not found`);
  }

  const preset = await loadPreset(profile.preset);
  if (!preset) {
    throw new Error(`Preset "${profile.preset}" not found`);
  }

  printCommandHeader(`Edit Profile`, profileLabel);
  console.log(pc.dim('Leave blank to keep current value'));
  console.log();

  // Edit profile label (name)
  const originalLabel = profile.label;
  const { newLabel } = await prompts({
    type: 'text',
    name: 'newLabel',
    message: 'Profile name:',
    initial: profile.label,
  });
  if (newLabel !== undefined && newLabel !== '' && newLabel !== profile.label) {
    if (await profileExists(newLabel)) {
      throw new Error(`Profile "${newLabel}" already exists`);
    }
    profile.label = newLabel;
  }

  // Edit env variables
  for (const [key, template] of Object.entries(preset.env)) {
    const currentValue = profile.env[key] || '';
    const isSecret = template.secret || false;

    const { value } = await prompts({
      type: isSecret ? 'password' : 'text',
      name: 'value',
      message: `${key} ${pc.dim(`[${isSecret ? '****' : currentValue}]`)}:`,
    });

    if (value !== undefined && value !== '') {
      profile.env[key] = value;
    }
  }

  // Edit model mapping
  if (preset.modelRoles && preset.modelRoles.length > 0) {
    console.log();
    const { editModels } = await prompts({
      type: 'select',
      name: 'editModels',
      message: 'Modify model mapping?',
      choices: [
        { title: 'No, keep current', value: false },
        { title: 'Yes, reconfigure', value: true },
      ],
      initial: 0,
    });

    if (editModels) {
      await editModelMapping(preset, profile.env);
    }
  }

  await saveProfile(profile, originalLabel);
  console.log();
  success(`Profile "${profile.label}" updated`);
  console.log();
}

async function editModelMapping(
  preset: Preset,
  envValues: Record<string, string>,
): Promise<void> {
  // Try to get model list
  let models: string[] = [];
  const baseUrl = envValues.ANTHROPIC_BASE_URL || '';
  const token = envValues.ANTHROPIC_AUTH_TOKEN || '';

  if (preset.capabilities?.['models.discovery'] && preset.modelDiscovery && baseUrl && token) {
    const spinner = ora('Fetching available models...').start();
    const result = await discoverModels(baseUrl, token, preset.modelDiscovery, 5000);
    spinner.stop();
    if (result.success) {
      models = result.models;
    }
  }

  if (models.length === 0 && preset.recommendedModels) {
    models = preset.recommendedModels;
  }

  console.log(pc.cyan(pc.bold(`${s.chevron} Model Configuration`)));

  if (models.length > 0) {
    for (const role of preset.modelRoles) {
      const envKey = preset.modelEnvMapping[role];
      if (!envKey) continue;
      const current = envValues[envKey] || '';

      const { model } = await prompts({
        type: 'select',
        name: 'model',
        message: `${role} Model:`,
        choices: [
          { title: `${pc.dim('Keep current:')} ${current}`, value: current },
          ...models.map((m) => ({ title: m, value: m })),
        ],
      });
      if (model !== undefined) {
        envValues[envKey] = model;
      }
    }
  } else {
    // Manual input mode
    for (const role of preset.modelRoles) {
      const envKey = preset.modelEnvMapping[role];
      if (!envKey) continue;
      const current = envValues[envKey] || '';

      const { model } = await prompts({
        type: 'text',
        name: 'model',
        message: `${role} Model ${pc.dim(`[${current}]`)}:`,
      });
      if (model !== undefined && model !== '') {
        envValues[envKey] = model;
      }
    }
  }
}
