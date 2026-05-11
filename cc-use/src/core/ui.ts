import pc from 'picocolors';

const ICONS = {
  success: pc.green('✓'),
  error: pc.red('✗'),
  warning: pc.yellow('⚠'),
  info: pc.blue('ℹ'),
};

const DEFAULT_MAX_WIDTH = 80;
const TABLE_PADDING = 2;

/** Strip ANSI escape codes for length calculation. */
function stripAnsi(str: string): string {
  return str.replace(/\[[0-9;]*m/g, '');
}

function visibleLength(str: string): number {
  return stripAnsi(str).length;
}

function padVisible(str: string, width: number): string {
  const len = visibleLength(str);
  return str + ' '.repeat(Math.max(0, width - len));
}

function truncate(str: string, maxWidth: number): string {
  if (visibleLength(str) <= maxWidth) return str;
  if (maxWidth <= 3) return stripAnsi(str).slice(0, maxWidth);

  let result = '';
  let count = 0;
  let inAnsi = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '') {
      inAnsi = true;
      result += char;
      continue;
    }
    if (inAnsi) {
      result += char;
      if (char === 'm') inAnsi = false;
      continue;
    }
    if (count >= maxWidth - 1) {
      result += '…';
      break;
    }
    result += char;
    count++;
  }
  return result;
}

export interface TableOptions {
  maxWidths?: number[];
}

/** Print a simple text table with dynamic column widths. */
export function printTable(
  headers: string[],
  rows: string[][],
  options?: TableOptions,
): void {
  if (rows.length === 0) return;

  const colCount = headers.length;
  const colWidths: number[] = new Array(colCount).fill(0);

  for (let i = 0; i < colCount; i++) {
    colWidths[i] = visibleLength(headers[i]);
  }

  for (const row of rows) {
    for (let i = 0; i < colCount; i++) {
      const cell = row[i] || '';
      colWidths[i] = Math.max(colWidths[i], visibleLength(cell));
    }
  }

  if (options?.maxWidths) {
    for (let i = 0; i < colCount; i++) {
      if (options.maxWidths[i]) {
        colWidths[i] = Math.min(colWidths[i], options.maxWidths[i]);
      }
    }
  }

  const totalWidth = colWidths.reduce((a, b) => a + b, 0) + (colCount - 1) * TABLE_PADDING;
  if (totalWidth > DEFAULT_MAX_WIDTH && !options?.maxWidths) {
    const excess = totalWidth - DEFAULT_MAX_WIDTH;
    const widestIdx = colWidths.indexOf(Math.max(...colWidths));
    colWidths[widestIdx] = Math.max(3, colWidths[widestIdx] - excess);
  }

  const printRow = (cells: string[]) => {
    const parts: string[] = [];
    for (let i = 0; i < colCount; i++) {
      const cell = truncate(cells[i] || '', colWidths[i]);
      parts.push(padVisible(cell, colWidths[i]));
    }
    console.log(parts.join('  '));
  };

  const printDivider = () => {
    const parts: string[] = [];
    for (let i = 0; i < colCount; i++) {
      parts.push(pc.dim('─'.repeat(colWidths[i])));
    }
    console.log(parts.join('  '));
  };

  printRow(headers.map((h) => pc.bold(h)));
  printDivider();
  for (const row of rows) {
    printRow(row);
  }
}

export interface InfoSection {
  title?: string;
  rows: [string, string][];
}

/** Print an info card with sections. */
export function printInfoCard(title: string, sections: InfoSection[]): void {
  const allLabels = sections.flatMap((s) => s.rows.map(([label]) => label));
  const maxLabelWidth = allLabels.length > 0
    ? Math.max(...allLabels.map((l) => visibleLength(l)))
    : 0;

  const lineWidth = Math.min(DEFAULT_MAX_WIDTH, visibleLength(title) + 4);
  const divider = pc.dim('─'.repeat(lineWidth));

  console.log(divider);
  console.log(`  ${pc.bold(title)}`);
  console.log(divider);

  let isFirstSection = true;
  for (const section of sections) {
    if (!isFirstSection) {
      console.log();
    }
    isFirstSection = false;

    if (section.title) {
      console.log(pc.bold(`  ${section.title}`));
    }
    for (const [label, value] of section.rows) {
      const paddedLabel = padVisible(`${label}:`, maxLabelWidth + 1);
      console.log(`    ${pc.dim(paddedLabel)} ${value}`);
    }
  }

  console.log(divider);
}

export type StatusType = 'success' | 'error' | 'warning' | 'info';

export interface StatusItem {
  text: string;
  type: StatusType;
}

/** Print a list of status items with colored icons. */
export function printStatusList(items: StatusItem[]): void {
  for (const item of items) {
    const icon = ICONS[item.type];
    console.log(`  ${icon}  ${item.text}`);
  }
}

/** Print a single status line. */
export function printStatus(type: StatusType, text: string): void {
  console.log(`${ICONS[type]}  ${text}`);
}

/** Print an empty state with optional hint. */
export function printEmptyState(message: string, hint?: string): void {
  console.log(`${ICONS.info}  ${message}`);
  if (hint) {
    console.log(`   ${pc.dim(hint)}`);
  }
}

/** Print a section header with underline. */
export function printSection(title: string): void {
  console.log();
  console.log(pc.bold(title));
  console.log(pc.dim('─'.repeat(Math.min(DEFAULT_MAX_WIDTH, visibleLength(title) * 2))));
}

/** Print custom help page. */
export function printHelp(): void {
  console.log(pc.bold('cc-use') + pc.dim(' — Claude Code Provider Runtime Management CLI'));
  console.log();
  console.log(pc.bold('Usage:') + ' cc-use [options] [command]');
  console.log();
  console.log(pc.bold('Commands:'));
  console.log();
  console.log(pc.dim('  Profile Management'));
  console.log(`    ${pc.cyan('use')} <profile>      Render settings.json for a profile`);
  console.log(`    ${pc.cyan('run')} <profile>      Render settings.json and launch Claude`);
  console.log(`    ${pc.cyan('add')}                Interactive create a new profile`);
  console.log(`    ${pc.cyan('list')}               List all profiles`);
  console.log(`    ${pc.cyan('show')} <profile>     Show profile details`);
  console.log(`    ${pc.cyan('edit')} <profile>     Edit an existing profile`);
  console.log(`    ${pc.cyan('remove')} <profiles>  Remove one or more profiles`);
  console.log(`    ${pc.cyan('export')} <profile>   Export a profile for sharing`);
  console.log();
  console.log(pc.dim('  Configuration'));
  console.log(`    ${pc.cyan('current')}            Show current active profile`);
  console.log(`    ${pc.cyan('rollback')}           Restore previous settings state`);
  console.log(`    ${pc.cyan('preset-list')}        List built-in provider presets`);
  console.log(`    ${pc.cyan('validate')} <profile> Validate profile configuration`);
  console.log();
  console.log(pc.bold('Options:'));
  console.log(`    -v, --version      Show version number`);
  console.log(`    -h, --help         Show help`);
  console.log();
  console.log(pc.bold('Examples:'));
  console.log(pc.dim('  # Apply a profile'));
  console.log('  cc-use use my-profile');
  console.log();
  console.log(pc.dim('  # Apply and launch Claude'));
  console.log('  cc-use run my-profile');
  console.log();
  console.log(pc.dim('  # Create a new profile'));
  console.log('  cc-use add');
  console.log();
  console.log(pc.dim('  # Shortcut: apply and run'));
  console.log('  cc-use my-profile');
}
