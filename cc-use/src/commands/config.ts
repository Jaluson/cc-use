import pc from 'picocolors';
import {
  getConfigValue,
  setConfigValue,
  deleteConfigValue,
  listConfig,
  validateKey,
  getAllowedKeys,
  getEnvConfig,
  type ConfigValue,
} from '../core/config.js';
import { printCommandHeader, printKeyValue, success, warning, s } from '../ui/index.js';
import { profileExists } from '../core/profile.js';

function formatValue(value: ConfigValue): string {
  return Array.isArray(value) ? value.join(' ') : value;
}

export async function configSetCommand(key: string, value: ConfigValue): Promise<void> {
  validateKey(key);
  if (key === 'profile') {
    const name = typeof value === 'string' ? value : value[0];
    if (!(await profileExists(name))) {
      throw new Error(`Profile "${name}" not found`);
    }
  }
  await setConfigValue(key, value);
  success(`Set ${key} = ${formatValue(value)}`);
}

export async function configGetCommand(key: string): Promise<void> {
  validateKey(key);
  const value = await getConfigValue(key);
  if (value === undefined) {
    console.log(pc.dim('(not set)'));
  } else {
    console.log(formatValue(value));
  }
}

export async function configDeleteCommand(key: string): Promise<void> {
  validateKey(key);
  const deleted = await deleteConfigValue(key);
  if (deleted) {
    success(`Deleted ${key}`);
  } else {
    warning(`Key "${key}" is not set`);
  }
}

export async function configListCommand(): Promise<void> {
  const config = await listConfig();
  const keys = getAllowedKeys();

  printCommandHeader('Defaults');
  console.log(pc.dim('  Fallback values used when not specified on command line'));
  console.log();

  const items = keys.map((key) => ({
    key,
    value: config[key] !== undefined ? formatValue(config[key]) : pc.dim('(not set)'),
  }));

  printKeyValue(items);

  console.log();
  console.log(pc.dim(`  ${s.arrow} cc-use config set <key> <value>`));
  console.log(pc.dim(`  ${s.arrow} cc-use config get <key>`));
  console.log();
}
