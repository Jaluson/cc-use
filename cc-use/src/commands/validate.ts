import pc from 'picocolors';
import { loadProfile } from '../core/profile.js';
import { loadPreset } from '../core/preset.js';
import { discoverModels } from '../core/model-discovery.js';
import type { ValidateLevel } from '../core/types.js';

export async function validateCommand(
  profileLabel: string,
  level: ValidateLevel = 'local',
): Promise<void> {
  const profile = await loadProfile(profileLabel);
  if (!profile) {
    throw new Error(`Profile "${profileLabel}" not found`);
  }

  const preset = await loadPreset(profile.preset);
  if (!preset) {
    throw new Error(`Preset "${profile.preset}" not found`);
  }

  console.log(pc.bold(`Validating profile: ${profileLabel}`));

  // Local checks
  const requiredFields = Object.entries(preset.env)
    .filter(([, template]) => !template.value)
    .map(([key]) => key);

  const missingFields = requiredFields.filter((key) => !profile.env[key]);
  if (missingFields.length > 0) {
    console.log(pc.red(`✗ Required env incomplete: ${missingFields.join(', ')}`));
  } else {
    console.log(pc.green('✓ Required env complete'));
  }

  // Online checks
  if (level === 'online' || level === 'discovery') {
    const baseUrl = profile.env.ANTHROPIC_BASE_URL || '';
    const token = profile.env.ANTHROPIC_AUTH_TOKEN || '';

    if (baseUrl && token) {
      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 10000);
        await fetch(baseUrl, { signal: controller.signal, method: 'HEAD' });
        console.log(pc.green('✓ Endpoint reachable'));
      } catch {
        console.log(pc.red('✗ Endpoint unreachable'));
      }

      if (preset.modelDiscovery) {
        const result = await discoverModels(baseUrl, token, preset.modelDiscovery, 10000);
        if (result.success) {
          console.log(pc.green('✓ Token valid'));
        } else {
          console.log(pc.red(`✗ Token invalid: ${result.error}`));
        }

        if (level === 'discovery' && result.success) {
          console.log(pc.green('✓ Models discovered'));

          for (const role of preset.modelRoles) {
            const envKey = preset.modelEnvMapping[role];
            const modelName = envKey ? profile.env[envKey] : undefined;
            if (modelName && result.models.includes(modelName)) {
              console.log(pc.green(`✓ ${role} model found: ${modelName}`));
            } else if (modelName) {
              console.log(pc.yellow(`✗ ${role} model not found: ${modelName}`));
            }
          }
        }
      }
    }
  }
}
