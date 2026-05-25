import pc from 'picocolors';
import {
  getSettingsConfig,
  setSettingsValue,
  deleteSettingsValue,
} from '../core/config.js';
import { printCommandHeader, success, warning, s } from '../ui/index.js';

function parseValue(valueStr: string): unknown {
  // Handle special cases for common values
  const lower = valueStr.toLowerCase();
  if (lower === 'true') return true;
  if (lower === 'false') return false;
  if (lower === 'null') return null;

  // Try parsing as JSON first
  try {
    return JSON.parse(valueStr);
  } catch {
    // Handle comma-separated arrays as a fallback
    // e.g., "npm,git,yarn" -> ["npm", "git", "yarn"]
    if (valueStr.includes(',') && !valueStr.includes(' ')) {
      return valueStr.split(',');
    }

    // If not valid JSON, treat as string
    return valueStr;
  }
}

function formatValue(value: unknown, indent = 0): string {
  const prefix = '  '.repeat(indent);
  if (value === null) {
    return pc.dim('null');
  }
  if (value === undefined) {
    return pc.dim('undefined');
  }
  if (typeof value === 'string') {
    return pc.green(`"${value}"`);
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return pc.yellow(String(value));
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map(v => formatValue(v, 0));
    return `[${items.join(', ')}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    const lines = entries.map(([k, v]) => {
      const formatted = formatValue(v, indent + 1);
      return `${prefix}  ${pc.cyan(k)}: ${formatted}`;
    });
    return `{\n${lines.join('\n')}\n${prefix}}`;
  }
  return String(value);
}

export async function configSettingsSetCommand(key: string, valueStr: string): Promise<void> {
  const value = parseValue(valueStr);
  await setSettingsValue(key, value);
  success(`Set settings.${key} = ${formatValue(value)}`);
}

export async function configSettingsGetCommand(key?: string): Promise<void> {
  const settings = await getSettingsConfig();

  if (key) {
    // Support nested key access using dot notation
    const parts = key.split('.');
    let current: unknown = settings;
    for (const part of parts) {
      if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        current = undefined;
        break;
      }
    }

    if (current === undefined) {
      console.log(pc.dim('(not set)'));
    } else {
      console.log(formatValue(current));
    }
  } else {
    if (Object.keys(settings).length === 0) {
      console.log(pc.dim('(no settings overrides configured)'));
    } else {
      console.log(formatValue(settings));
    }
  }
}

export async function configSettingsDeleteCommand(key: string): Promise<void> {
  const deleted = await deleteSettingsValue(key);
  if (deleted) {
    success(`Deleted settings.${key}`);
  } else {
    warning(`Settings key "${key}" is not set`);
  }
}

export async function configSettingsListCommand(): Promise<void> {
  const settings = await getSettingsConfig();

  printCommandHeader('Settings Overrides');
  console.log(pc.dim('  Custom settings.json fields (merged with profile/preset)'));
  console.log();

  if (Object.keys(settings).length === 0) {
    console.log(pc.dim('  (no settings overrides configured)'));
  } else {
    console.log(formatValue(settings));
  }

  console.log();
  console.log(pc.dim(`  ${s.arrow} cc-use config settings set <key> <value>`));
  console.log(pc.dim(`  ${s.arrow} cc-use config settings get [key]`));
  console.log(pc.dim(`  ${s.arrow} cc-use config settings delete <key>`));
  console.log();
}
