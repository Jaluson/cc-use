import { Command } from 'commander';
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
import type { ValidateLevel } from './core/types.js';

function handleError(error: unknown): never {
  console.error(pc.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
  process.exit(1);
}

const program = new Command();

program
  .name('cc-use')
  .description('Claude Code Provider Runtime Management CLI')
  .version('0.1.3', '-v, --version');

program
  .command('use <profile>')
  .description('Render settings.json for a profile without launching Claude')
  .option('--dry-run', 'Preview the rendered settings.json without writing')
  .action(async (profileLabel: string, options: { dryRun?: boolean }) => {
    try { await useCommand(profileLabel, process.cwd(), { dryRun: options.dryRun }); }
    catch (error) { handleError(error); }
  });

program
  .command('run <profile>')
  .description('Render settings.json and launch Claude')
  .allowUnknownOption()
  .action(async (profileLabel: string, _options: unknown, command: Command) => {
    try {
      const rawArgs = command.args.slice(1);
      const separatorIndex = rawArgs.indexOf('--');
      const claudeArgs = separatorIndex >= 0
        ? rawArgs.slice(separatorIndex + 1)
        : rawArgs;
      await runCommand(profileLabel, claudeArgs);
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

program
  .command('remove <profiles...>')
  .alias('rm')
  .description('Remove one or more profiles')
  .action(async (profiles: string[]) => {
    try { await removeCommand(profiles); }
    catch (error) { handleError(error); }
  });

program
  .command('show <profile>')
  .description('Show profile details')
  .action(async (profile: string) => {
    try { await showCommand(profile); }
    catch (error) { handleError(error); }
  });

program
  .command('edit <profile>')
  .description('Edit an existing profile')
  .action(async (profile: string) => {
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
  .command('validate <profile>')
  .description('Validate profile configuration')
  .option('--online', 'Include network connectivity checks')
  .option('--discovery', 'Include model discovery checks')
  .action(async (profile: string, options: { online?: boolean; discovery?: boolean }) => {
    try {
      let level: ValidateLevel = 'local';
      if (options.discovery) level = 'discovery';
      else if (options.online) level = 'online';
      await validateCommand(profile, level);
    } catch (error) { handleError(error); }
  });

program
  .command('export <profile>')
  .description('Export a profile for sharing (secrets are masked)')
  .option('-o, --output <file>', 'Output file path')
  .action(async (profile: string, options: { output?: string }) => {
    try { await exportCommand(profile, options); }
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
