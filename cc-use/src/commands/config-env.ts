import pc from 'picocolors';
import {
  getEnvConfig,
  setEnvValue,
  deleteEnvValue,
} from '../core/config.js';
import { printCommandHeader, success, warning, s } from '../ui/index.js';

export async function configEnvSetCommand(pairs: string[]): Promise<void> {
  if (pairs.length === 0) {
    throw new Error('At least one KEY=VALUE pair is required');
  }

  const results: string[] = [];
  for (const pair of pairs) {
    const match = pair.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) {
      throw new Error(`Invalid env format. Use: KEY=VALUE (got "${pair}")`);
    }
    const [, key, value] = match;
    await setEnvValue(key, value);
    results.push(`${key}=${value}`);
  }

  success(`Set env: ${results.join(', ')}`);
}

export async function configEnvGetCommand(key?: string): Promise<void> {
  const env = await getEnvConfig();

  if (key) {
    const value = env[key];
    if (value === undefined) {
      console.log(pc.dim('(not set)'));
    } else {
      console.log(value);
    }
  } else {
    const entries = Object.entries(env);
    if (entries.length === 0) {
      console.log(pc.dim('(no environment variables set)'));
    } else {
      entries.forEach(([k, v]) => console.log(`  ${pc.cyan(k)}: ${v}`));
    }
  }
}

export async function configEnvDeleteCommand(key: string): Promise<void> {
  const deleted = await deleteEnvValue(key);
  if (deleted) {
    success(`Deleted env: ${key}`);
  } else {
    warning(`Environment variable "${key}" is not set`);
  }
}

export async function configEnvListCommand(): Promise<void> {
  const env = await getEnvConfig();

  printCommandHeader('Environment Variables');
  console.log(pc.dim('  Custom environment variables passed to Claude Code'));
  console.log();

  const entries = Object.entries(env);
  if (entries.length === 0) {
    console.log(pc.dim('  (no environment variables set)'));
  } else {
    entries.forEach(([k, v]) => console.log(`  ${pc.cyan(k)}: ${v}`));
  }

  console.log();
  console.log(pc.dim(`  ${s.arrow} cc-use config env set KEY=VALUE`));
  console.log(pc.dim(`  ${s.arrow} cc-use config env get [key]`));
  console.log(pc.dim(`  ${s.arrow} cc-use config env delete <key>`));
  console.log();
}
