import prompts from 'prompts';
import pc from 'picocolors';
import ora from 'ora';
import { loadProfile, saveProfile, profileExists } from '../core/profile.js';
import { loadPreset } from '../core/preset.js';
import { discoverModels } from '../core/model-discovery.js';
import type { Preset } from '../core/types.js';

export async function editCommand(profileLabel: string): Promise<void> {
  const profile = await loadProfile(profileLabel);
  if (!profile) {
    throw new Error(`Profile "${profileLabel}" not found`);
  }

  const preset = await loadPreset(profile.preset);
  if (!preset) {
    throw new Error(`Preset "${profile.preset}" not found`);
  }

  console.log(pc.bold(`Editing profile: ${profileLabel}`));
  console.log(pc.dim('Leave blank to keep current value'));

  // Edit profile label (name)
  const originalLabel = profile.label;
  const { newLabel } = await prompts({
    type: 'text',
    name: 'newLabel',
    message: `Profile name [${profile.label}]:`,
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
      message: `${key} [${isSecret ? '****' : currentValue}]:`,
    });

    if (value !== undefined && value !== '') {
      profile.env[key] = value;
    }
  }

  // Edit model mapping
  if (preset.modelRoles && preset.modelRoles.length > 0) {
    const { editModels } = await prompts({
      type: 'select',
      name: 'editModels',
      message: '是否修改模型映射?',
      choices: [
        { title: '否', value: false },
        { title: '是', value: true },
      ],
      initial: 0,
    });

    if (editModels) {
      await editModelMapping(preset, profile.env);
    }
  }

  await saveProfile(profile, originalLabel);
  console.log(pc.green(`✓ Profile "${profile.label}" updated`));
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

  if (models.length > 0) {
    // Select mode
    for (const role of preset.modelRoles) {
      const envKey = preset.modelEnvMapping[role];
      if (!envKey) continue;
      const current = envValues[envKey] || '';

      const { model } = await prompts({
        type: 'select',
        name: 'model',
        message: `${role} Model [${current}]:`,
        choices: [
          { title: `(keep: ${current})`, value: current },
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
        message: `${role} Model [${current}]:`,
      });
      if (model !== undefined && model !== '') {
        envValues[envKey] = model;
      }
    }
  }
}
