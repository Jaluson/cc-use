import { Command } from 'commander';
import { createRequire } from 'node:module';
import pc from 'picocolors';
import { useCommand } from './commands/use.js';
import { runCommand } from './commands/run.js';
import { addCommand } from './commands/add.js';
import { listCommand } from './commands/list.js';
import { removeCommand } from './commands/remove.js';
import { showCommand } from './commands/show.js';
import { currentCommand } from './commands/current.js';
import { presetListCommand } from './commands/preset-list.js';
import { validateCommand } from './commands/validate.js';
import { editCommand } from './commands/edit.js';
import { rollbackCommand } from './commands/rollback.js';
import { exportCommand } from './commands/export.js';
import { importFromCcSwitchCommand } from './commands/import-from-cc-switch.js';
import { configSetCommand, configGetCommand, configDeleteCommand, configListCommand } from './commands/config.js';
import { configEnvSetCommand, configEnvGetCommand, configEnvDeleteCommand, configEnvListCommand } from './commands/config-env.js';
import { configSettingsSetCommand, configSettingsGetCommand, configSettingsDeleteCommand, configSettingsListCommand } from './commands/config-settings.js';
import { getConfigValue } from './core/config.js';
import { promptProfileSelection } from './commands/_interactive.js';
import { printBox, s } from './ui/index.js';
import type { ValidateLevel } from './core/types.js';

function handleError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  console.error();
  printBox(
    [
      pc.red(pc.bold(`${s.error} Error`)),
      '',
      pc.red(message),
    ],
    { borderColor: pc.red },
  );
  console.error();
  process.exit(1);
}

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const program = new Command();

program
  .name('cc-use')
  .description('Claude Code Provider Runtime Management CLI')
  .version(pkg.version, '-v, --version');

program
  .command('use [profile]')
  .description('Render settings.json for a profile without launching Claude')
  .option('--dry-run', 'Preview the rendered settings.json without writing')
  .action(async (profileLabel: string | undefined, options: { dryRun?: boolean }) => {
    try {
      const profile = profileLabel ?? await getConfigValue('profile');
      await useCommand(profile, process.cwd(), { dryRun: options.dryRun });
    }
    catch (error) { handleError(error); }
  });

program
  .command('run [profile]')
  .description('Render settings.json and launch Claude')
  .allowUnknownOption()
  .action(async (profileLabel: string | undefined, _options: unknown, command: Command) => {
    try {
      const profile = profileLabel ?? await getConfigValue('profile');
      const rawArgs = command.args.slice(1);
      const separatorIndex = rawArgs.indexOf('--');
      const cliClaudeArgs = separatorIndex >= 0
        ? rawArgs.slice(separatorIndex + 1)
        : rawArgs;
      const defaultClaudeArgs = await getConfigValue('claudeArgs');
      const defaultArray = Array.isArray(defaultClaudeArgs) ? defaultClaudeArgs : defaultClaudeArgs ? splitArgs(defaultClaudeArgs) : [];
      const claudeArgs = defaultArray.length > 0
        ? mergeArgs(defaultArray, cliClaudeArgs)
        : cliClaudeArgs;
      await runCommand(profile, claudeArgs);
    } catch (error) { handleError(error); }
  });

program
  .command('add')
  .description('Interactive create a new profile')
  .option('--preset <preset>', 'Preset ID')
  .option('--profile <name>', 'Profile name')
  .action(async (options: { preset?: string; profile?: string }) => {
    try { await addCommand(options); }
    catch (error) { handleError(error); }
  });

program
  .command('list')
  .alias('ls')
  .description('List all profiles')
  .action(async () => {
    try { await listCommand(); }
    catch (error) { handleError(error); }
  });

function collect(value: string, previous: string[]): string[] {
  return previous.concat([value]);
}

program
  .command('remove [profiles...]')
  .alias('rm')
  .description('Remove one or more profiles')
  .option('-p, --profile <profile>', 'Profile to remove (can be used multiple times)', collect, [])
  .action(async (profiles: string[], options: { profile: string[] }) => {
    const allProfiles = [...profiles, ...options.profile];
    try { await removeCommand(allProfiles); }
    catch (error) { handleError(error); }
  });

program
  .command('show [profile]')
  .description('Show profile details')
  .action(async (profile: string | undefined) => {
    try { await showCommand(profile); }
    catch (error) { handleError(error); }
  });

program
  .command('edit [profile]')
  .description('Edit an existing profile')
  .action(async (profile: string | undefined) => {
    try { await editCommand(profile); }
    catch (error) { handleError(error); }
  });

program
  .command('current')
  .description('Show current active profile')
  .action(async () => {
    try { await currentCommand(); }
    catch (error) { handleError(error); }
  });

program
  .command('rollback')
  .alias('clean')
  .description('Remove cc-use managed config and restore previous state')
  .action(async () => {
    try { await rollbackCommand(); }
    catch (error) { handleError(error); }
  });

program
  .command('preset-list')
  .description('List built-in provider presets')
  .action(async () => {
    try { await presetListCommand(); }
    catch (error) { handleError(error); }
  });

program
  .command('validate [profile]')
  .description('Validate profile configuration')
  .option('--online', 'Include network connectivity checks')
  .option('--discovery', 'Include model discovery checks')
  .action(async (profile: string | undefined, options: { online?: boolean; discovery?: boolean }) => {
    try {
      let level: ValidateLevel = 'local';
      if (options.discovery) level = 'discovery';
      else if (options.online) level = 'online';
      await validateCommand(profile, level);
    } catch (error) { handleError(error); }
  });

program
  .command('export [profile]')
  .description('Export a profile for sharing (secrets are masked)')
  .option('-o, --output <file>', 'Output file path')
  .action(async (profile: string | undefined, options: { output?: string }) => {
    try { await exportCommand(profile, options); }
    catch (error) { handleError(error); }
  });

program
  .command('import-from-cc-switch')
  .alias('import-cc')
  .description('Import profiles from CC Switch')
  .option('--dry-run', 'Preview without writing')
  .action(async (options: { dryRun?: boolean }) => {
    try {
      await importFromCcSwitchCommand({ dryRun: options.dryRun });
    } catch (error) {
      handleError(error);
    }
  });

// config command with subcommands
const configCmd = program
  .command('config')
  .description('Manage cc-use configuration')
  .action(async () => {
    try { await configListCommand(); }
    catch (error) { handleError(error); }
  });

configCmd
  .command('set <key> [value...]')
  .allowUnknownOption()
  .description('Set a config value')
  .action(async (key: string, valueParts: string[]) => {
    try {
      if (valueParts.length === 0) throw new Error('Value is required');
      const value = key === 'claudeArgs' ? valueParts : valueParts.join(' ');
      await configSetCommand(key, value);
    }
    catch (error) { handleError(error); }
  });

configCmd
  .command('get <key>')
  .description('Get a config value')
  .action(async (key: string) => {
    try { await configGetCommand(key); }
    catch (error) { handleError(error); }
  });

configCmd
  .command('delete <key>')
  .description('Delete a config value')
  .action(async (key: string) => {
    try { await configDeleteCommand(key); }
    catch (error) { handleError(error); }
  });

configCmd
  .command('list')
  .description('List all config values')
  .action(async () => {
    try { await configListCommand(); }
    catch (error) { handleError(error); }
  });

// env subcommands
const envCmd = configCmd
  .command('env')
  .description('Manage environment variables')
  .action(async () => {
    try { await configEnvListCommand(); }
    catch (error) { handleError(error); }
  });

envCmd
  .command('set <pair...>')
  .description('Set environment variables (KEY=VALUE format)')
  .action(async (pairs: string[]) => {
    try { await configEnvSetCommand(pairs); }
    catch (error) { handleError(error); }
  });

envCmd
  .command('get [key]')
  .description('Get environment variable value(s)')
  .action(async (key?: string) => {
    try { await configEnvGetCommand(key); }
    catch (error) { handleError(error); }
  });

envCmd
  .command('delete <key>')
  .description('Delete an environment variable')
  .action(async (key: string) => {
    try { await configEnvDeleteCommand(key); }
    catch (error) { handleError(error); }
  });

envCmd
  .command('list')
  .description('List all environment variables')
  .action(async () => {
    try { await configEnvListCommand(); }
    catch (error) { handleError(error); }
  });

// settings subcommands
const settingsCmd = configCmd
  .command('settings')
  .description('Manage settings.json field overrides')
  .action(async () => {
    try { await configSettingsListCommand(); }
    catch (error) { handleError(error); }
  });

settingsCmd
  .command('set <key> <value>')
  .description('Set a settings.json field value')
  .action(async (key: string, value: string) => {
    try { await configSettingsSetCommand(key, value); }
    catch (error) { handleError(error); }
  });

settingsCmd
  .command('get [key]')
  .description('Get settings.json field value(s)')
  .action(async (key?: string) => {
    try { await configSettingsGetCommand(key); }
    catch (error) { handleError(error); }
  });

settingsCmd
  .command('delete <key>')
  .description('Delete a settings.json field override')
  .action(async (key: string) => {
    try { await configSettingsDeleteCommand(key); }
    catch (error) { handleError(error); }
  });

settingsCmd
  .command('list')
  .description('List all settings.json field overrides')
  .action(async () => {
    try { await configSettingsListCommand(); }
    catch (error) { handleError(error); }
  });

// Handle `cc-use <profile>` as shortcut for `cc-use run <profile>`
const args = process.argv.slice(2);
if (args.length > 0) {
  const firstArg = args[0];
  const isKnownCommand = program.commands.some(
    (cmd) => cmd.name() === firstArg || cmd.alias() === firstArg,
  );

  if (!isKnownCommand && !firstArg.startsWith('-')) {
    process.argv.splice(2, 0, 'run');
  }
}

if (process.argv.length <= 2) {
  program.outputHelp();
  process.exit(0);
}

program.parse();

// Split a string into args respecting quoted segments
function splitArgs(str: string): string[] {
  const result: string[] = [];
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(str)) !== null) {
    result.push(match[1] ?? match[2] ?? match[0]);
  }
  return result;
}

// Merge default args with CLI args; CLI wins on conflicts
// e.g. default: --model opus --verbose  cli: --model sonnet
//   => --model sonnet --verbose
function mergeArgs(defaults: string[], overrides: string[]): string[] {
  // Collect CLI flags (both --flag value pairs and boolean --flags)
  const cliFlags = new Set<string>();
  for (let i = 0; i < overrides.length; i++) {
    if (overrides[i].startsWith('-')) {
      cliFlags.add(overrides[i]);
    }
  }

  const result: string[] = [];
  let i = 0;
  while (i < defaults.length) {
    const token = defaults[i];
    if (token.startsWith('-') && cliFlags.has(token)) {
      // Skip this flag + its value if it has one
      i++;
      if (i < defaults.length && !defaults[i].startsWith('-')) i++;
      continue;
    }
    result.push(token);
    i++;
  }

  return [...result, ...overrides];
}
