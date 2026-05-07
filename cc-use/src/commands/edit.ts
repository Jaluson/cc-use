import prompts from 'prompts';
import pc from 'picocolors';
import { loadProfile, saveProfile } from '../core/profile.js';
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
      type: 'confirm',
      name: 'editModels',
      message: '是否修改模型映射?',
      initial: false,
    });

    if (editModels) {
      await editModelMapping(preset, profile.env);
    }
  }

  await saveProfile(profile);
  console.log(pc.green(`✓ Profile "${profileLabel}" updated`));
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
    const result = await discoverModels(baseUrl, token, preset.modelDiscovery, 5000);
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
