import prompts from 'prompts';
import pc from 'picocolors';
import ora from 'ora';
import { getAllPresets } from '../core/preset.js';
import { saveProfile, profileExists } from '../core/profile.js';
import { discoverModels } from '../core/model-discovery.js';
import type { Profile, Preset } from '../core/types.js';

export async function addCommand(
  options: { preset?: string; profile?: string } = {},
): Promise<void> {
  const presets = await getAllPresets();

  let presetId = options.preset;
  if (!presetId) {
    const { selected } = await prompts({
      type: 'select',
      name: 'selected',
      message: 'Select Provider Preset:',
      choices: presets.map((p) => ({ title: p.label, value: p.id })),
    });
    if (!selected) return;
    presetId = selected;
  }

  const preset = presets.find((p) => p.id === presetId);
  if (!preset) {
    throw new Error(`Preset "${presetId}" not found`);
  }

  let profileName: string = options.profile || '';
  if (!profileName) {
    const { name } = await prompts({
      type: 'text',
      name: 'name',
      message: 'Enter profile name:',
      initial: preset.id,
      validate: (value: string) => {
        if (!value) return 'Name cannot be empty';
        return true;
      },
    });
    if (!name) return;
    profileName = name as string;
  }

  if (await profileExists(profileName)) {
    const { overwrite } = await prompts({
      type: 'select',
      name: 'overwrite',
      message: `Profile "${profileName}" already exists. Overwrite?`,
      choices: [
        { title: 'No', value: false },
        { title: 'Yes', value: true },
      ],
      initial: 0,
    });
    if (!overwrite) return;
  }

  const envValues: Record<string, string> = {};
  for (const [key, template] of Object.entries(preset.env)) {
    const defaultValue = template.value || '';
    const isSecret = template.secret || false;

    const { value } = await prompts({
      type: isSecret ? 'password' : 'text',
      name: 'value',
      message: `${key}${template.description ? ` (${template.description})` : ''}${defaultValue ? ` (default: ${defaultValue})` : ''}:`,
      initial: defaultValue,
      validate: (input: string) => {
        if (!defaultValue && !input) return 'This field is required';
        return true;
      },
    });

    if (value === undefined) return;
    envValues[key] = value || defaultValue;
  }

  if (preset.modelRoles && preset.modelRoles.length > 0) {
    const completed = await promptModelMapping(preset, envValues);
    if (!completed) return;
  }

  const profile: Profile = {
    version: 1,
    preset: preset.id,
    presetVersion: preset.version,
    label: profileName,
    env: envValues,
    configFileName: preset.configFileName,
  };

  await saveProfile(profile);
  console.log(pc.green(`✓ Profile [${profileName}] saved`));
}

async function promptModelMapping(
  preset: Preset,
  envValues: Record<string, string>,
): Promise<boolean> {
  let models: string[] = [];
  let discoveryFailed = false;
  let discoveryError: string | undefined;

  if (preset.capabilities?.['models.discovery'] && preset.modelDiscovery) {
    const baseUrl = envValues.ANTHROPIC_BASE_URL || '';
    const token = envValues.ANTHROPIC_AUTH_TOKEN || '';

    if (baseUrl && token) {
      const spinner = ora('Fetching remote model list...').start();
      const result = await discoverModels(baseUrl, token, preset.modelDiscovery, 5000);
      spinner.stop();
      if (result.success && result.models.length > 0) {
        models = result.models;
      } else if (result.success) {
        discoveryFailed = true;
        discoveryError = 'Remote API returned no models. Please check if Token and Base URL are valid';
      } else {
        discoveryFailed = true;
        discoveryError = result.error;
      }
    }
  }

  // Only use recommended models when remote discovery was not attempted (not supported or missing credentials)
  if (models.length === 0 && !discoveryFailed && preset.recommendedModels) {
    models = preset.recommendedModels;
  }

  if (models.length === 0) {
    if (discoveryFailed) {
      console.log(pc.yellow(`⚠ Failed to fetch model list: ${discoveryError || 'Unknown error'}`));
      const { action } = await prompts({
        type: 'select',
        name: 'action',
        message: 'Choose an action:',
        choices: [
          { title: 'Enter model name manually', value: 'manual' },
          { title: 'Exit', value: 'exit' },
        ],
      });
      if (action === 'exit' || action === undefined) return false;
      return await promptManualModels(preset, envValues);
    } else {
      return await promptManualModels(preset, envValues);
    }
  }

  const { same } = await prompts({
    type: 'select',
    name: 'same',
    message: 'Use the same model for all roles?',
    choices: [
      { title: 'Yes', value: true },
      { title: 'No', value: false },
    ],
    initial: 0,
  });
  if (same === undefined) return false;

  if (same) {
    const { model } = await prompts({
      type: 'select',
      name: 'model',
      message: 'Select model:',
      choices: models.map((m) => ({ title: m, value: m })),
    });
    if (!model) return false;

    for (const role of preset.modelRoles) {
      const envKey = preset.modelEnvMapping[role];
      if (envKey) {
        envValues[envKey] = model;
      }
    }
  } else {
    let previousModel = '';
    for (const role of preset.modelRoles) {
      const envKey = preset.modelEnvMapping[role];
      if (!envKey) continue;

      const choices = [
        ...(previousModel ? [{ title: `[Inherit: ${previousModel}]`, value: previousModel }] : []),
        ...models.map((m) => ({ title: m, value: m })),
      ];

      const { model } = await prompts({
        type: 'select',
        name: 'model',
        message: `${role} Model:`,
        choices,
      });
      if (model === undefined) return false;

      envValues[envKey] = model;
      previousModel = model;
    }
  }

  return true;
}

async function promptManualModels(
  preset: Preset,
  envValues: Record<string, string>,
): Promise<boolean> {
  const { same } = await prompts({
    type: 'select',
    name: 'same',
    message: 'Use the same model for all roles?',
    choices: [
      { title: 'Yes', value: true },
      { title: 'No', value: false },
    ],
    initial: 0,
  });
  if (same === undefined) return false;

  if (same) {
    const { model } = await prompts({
      type: 'text',
      name: 'model',
      message: 'Enter model name:',
    });
    if (!model) return false;

    for (const role of preset.modelRoles) {
      const envKey = preset.modelEnvMapping[role];
      if (envKey) {
        envValues[envKey] = model;
      }
    }
  } else {
    let previousModel = '';
    for (const role of preset.modelRoles) {
      const envKey = preset.modelEnvMapping[role];
      if (!envKey) continue;

      const { model } = await prompts({
        type: 'text',
        name: 'model',
        message: `${role} Model:${previousModel ? ` (press Enter to inherit: ${previousModel})` : ''}:`,
      });
      if (model === undefined) return false;

      envValues[envKey] = model || previousModel;
      previousModel = envValues[envKey];
    }
  }

  return true;
}
