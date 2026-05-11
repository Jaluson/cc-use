import ora from 'ora';
import pc from 'picocolors';
import { loadProfile } from '../core/profile.js';
import { loadPreset } from '../core/preset.js';
import { discoverModels } from '../core/model-discovery.js';
import { validateProfile } from '../core/schema.js';
import { printCommandHeader, printBox, s } from '../ui/index.js';
import { promptProfileSelectionWithInfo } from './_interactive.js';
import type { ValidateLevel } from '../core/types.js';

export async function validateCommand(
  profileLabel: string | undefined,
  level: ValidateLevel = 'local',
): Promise<void> {
  let label = profileLabel;
  if (!label) {
    label = await promptProfileSelectionWithInfo('Select a profile to validate:');
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

  printCommandHeader('Validate Profile', profileLabel);

  const results: { status: 'pass' | 'fail' | 'warn'; message: string }[] = [];

  // Schema validation
  const schemaResult = validateProfile(profile, preset);
  if (schemaResult.valid) {
    results.push({ status: 'pass', message: 'Schema valid' });
  } else {
    for (const err of schemaResult.errors) {
      results.push({ status: 'fail', message: `${err.field}: ${err.message}` });
    }
  }

  // Local checks
  const requiredFields = Object.entries(preset.env)
    .filter(([, template]) => !template.value)
    .map(([key]) => key);

  const missingFields = requiredFields.filter((key) => !profile.env[key]);
  if (missingFields.length > 0) {
    results.push({ status: 'fail', message: `Required env incomplete: ${missingFields.join(', ')}` });
  } else {
    results.push({ status: 'pass', message: 'Required env complete' });
  }

  // Online checks
  if (level === 'online' || level === 'discovery') {
    const baseUrl = profile.env.ANTHROPIC_BASE_URL || '';
    const token = profile.env.ANTHROPIC_AUTH_TOKEN || '';

    if (baseUrl && token) {
      const spinner1 = ora('Checking endpoint...').start();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        await fetch(baseUrl, { signal: controller.signal, method: 'HEAD' });
        clearTimeout(timeout);
        spinner1.succeed('Endpoint reachable');
      } catch {
        spinner1.fail('Endpoint unreachable');
      }

      if (preset.modelDiscovery) {
        const spinner2 = ora('Verifying token...').start();
        const result = await discoverModels(baseUrl, token, preset.modelDiscovery, 10000);
        if (result.success) {
          spinner2.succeed('Token valid');
        } else {
          spinner2.fail(`Token invalid: ${result.error}`);
        }

        if (level === 'discovery' && result.success) {
          const spinner3 = ora('Discovering models...').start();
          spinner3.succeed('Models discovered');

          for (const role of preset.modelRoles) {
            const envKey = preset.modelEnvMapping[role];
            const modelName = envKey ? profile.env[envKey] : undefined;
            if (modelName && result.models.includes(modelName)) {
              results.push({ status: 'pass', message: `${role} model found: ${modelName}` });
            } else if (modelName) {
              results.push({ status: 'warn', message: `${role} model not found: ${modelName}` });
            }
          }
        }
      }
    }
  }

  // Print summary
  console.log();
  console.log(pc.cyan(pc.bold(`${s.chevron} Validation Results`)));
  console.log(pc.dim('  ' + '─'.repeat(30)));

  for (const r of results) {
    const icon = r.status === 'pass' ? pc.green(s.success) : r.status === 'fail' ? pc.red(s.error) : pc.yellow(s.warning);
    const text = r.status === 'pass' ? pc.white(r.message) : r.status === 'fail' ? pc.red(r.message) : pc.yellow(r.message);
    console.log(`  ${icon} ${text}`);
  }

  const passCount = results.filter((r) => r.status === 'pass').length;
  const failCount = results.filter((r) => r.status === 'fail').length;

  console.log();
  if (failCount === 0) {
    printBox([pc.green(`${s.success} All checks passed`)], { borderColor: pc.green });
  } else {
    printBox([pc.red(`${s.error} ${failCount} check(s) failed`)], { borderColor: pc.red });
  }
  console.log();
}
