import prompts from 'prompts';
import pc from 'picocolors';
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
      message: '选择 Provider Preset:',
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
      message: '设置 profile 名称:',
      initial: preset.id,
      validate: (value: string) => {
        if (!value) return '名称不能为空';
        return true;
      },
    });
    if (!name) return;
    profileName = name as string;
  }

  if (await profileExists(profileName)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Profile "${profileName}" 已存在，是否覆盖?`,
      initial: false,
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
      message: `${key}${template.description ? ` (${template.description})` : ''}${defaultValue ? ` (默认: ${defaultValue})` : ''}:`,
      initial: defaultValue,
      validate: (input: string) => {
        if (!defaultValue && !input) return '此项必填';
        return true;
      },
    });

    if (value === undefined) return;
    envValues[key] = value || defaultValue;
  }

  if (preset.modelRoles && preset.modelRoles.length > 0) {
    await promptModelMapping(preset, envValues);
  }

  const profile: Profile = {
    version: 1,
    preset: preset.id,
    presetVersion: preset.version,
    label: profileName,
    env: envValues,
  };

  await saveProfile(profile);
  console.log(pc.green(`✓ Profile [${profileName}] 已保存`));
}

async function promptModelMapping(
  preset: Preset,
  envValues: Record<string, string>,
): Promise<void> {
  let models: string[] = [];

  if (preset.capabilities?.['models.discovery'] && preset.modelDiscovery) {
    const baseUrl = envValues.ANTHROPIC_BASE_URL || '';
    const token = envValues.ANTHROPIC_AUTH_TOKEN || '';

    if (baseUrl && token) {
      const result = await discoverModels(baseUrl, token, preset.modelDiscovery, 5000);
      if (result.success) {
        models = result.models;
      }
    }
  }

  if (models.length === 0 && preset.recommendedModels) {
    models = preset.recommendedModels;
  }

  if (models.length === 0) {
    // No models available: manual input mode
    await promptManualModels(preset, envValues);
    return;
  }

  const { same } = await prompts({
    type: 'confirm',
    name: 'same',
    message: '是否为所有角色使用同一模型?',
    initial: true,
  });
  if (same === undefined) return;

  if (same) {
    const { model } = await prompts({
      type: 'select',
      name: 'model',
      message: '选择模型:',
      choices: models.map((m) => ({ title: m, value: m })),
    });
    if (!model) return;

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
        ...(previousModel ? [{ title: `[继承: ${previousModel}]`, value: previousModel }] : []),
        ...models.map((m) => ({ title: m, value: m })),
      ];

      const { model } = await prompts({
        type: 'select',
        name: 'model',
        message: `${role} Model:`,
        choices,
      });
      if (model === undefined) return;

      envValues[envKey] = model;
      previousModel = model;
    }
  }
}

async function promptManualModels(
  preset: Preset,
  envValues: Record<string, string>,
): Promise<void> {
  const { same } = await prompts({
    type: 'confirm',
    name: 'same',
    message: '是否为所有角色使用同一模型?',
    initial: true,
  });
  if (same === undefined) return;

  if (same) {
    const { model } = await prompts({
      type: 'text',
      name: 'model',
      message: '输入模型名称:',
    });
    if (!model) return;

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
        message: `${role} Model:${previousModel ? ` (回车继承: ${previousModel})` : ''}:`,
      });
      if (model === undefined) return;

      envValues[envKey] = model || previousModel;
      previousModel = envValues[envKey];
    }
  }
}
