import pc from 'picocolors';

export interface TableColumn {
  key: string;
  header: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  color?: (text: string) => string;
}

export interface TableRow {
  [key: string]: string | number | undefined;
}

// Unicode box-drawing for tables
const tbl = {
  h: '─',
  v: '│',
  tl: '╭',
  tr: '╮',
  bl: '╰',
  br: '╯',
  cross: '┼',
  tJoin: '┬',
  bJoin: '┴',
  lJoin: '├',
  rJoin: '┤',
};

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\[[0-9;]*m/g, '');
}

function padEnd(str: string, width: number): string {
  const visibleLen = stripAnsi(str).length;
  if (visibleLen >= width) return str;
  return str + ' '.repeat(width - visibleLen);
}

function padStart(str: string, width: number): string {
  const visibleLen = stripAnsi(str).length;
  if (visibleLen >= width) return str;
  return ' '.repeat(width - visibleLen) + str;
}

function padCenter(str: string, width: number): string {
  const visibleLen = stripAnsi(str).length;
  if (visibleLen >= width) return str;
  const left = Math.floor((width - visibleLen) / 2);
  const right = width - visibleLen - left;
  return ' '.repeat(left) + str + ' '.repeat(right);
}

function formatCell(value: string, width: number, align: 'left' | 'right' | 'center' = 'left'): string {
  switch (align) {
    case 'right':
      return padStart(value, width);
    case 'center':
      return padCenter(value, width);
    default:
      return padEnd(value, width);
  }
}

/**
 * Render a table with borders.
 */
export function drawTable(
  columns: TableColumn[],
  rows: TableRow[],
  options: { compact?: boolean; borderColor?: (text: string) => string } = {},
): string[] {
  const { compact = false, borderColor = pc.gray } = options;

  // Calculate column widths
  const colWidths = columns.map((col) => {
    const headerWidth = stripAnsi(col.header).length;
    const maxDataWidth = rows.reduce((max, row) => {
      const val = row[col.key];
      const valStr = val === undefined ? '' : String(val);
      return Math.max(max, stripAnsi(valStr).length);
    }, 0);
    return Math.max(headerWidth, maxDataWidth, col.width || 0) + (compact ? 1 : 2);
  });

  const totalWidth = colWidths.reduce((sum, w) => sum + w, 0) + colWidths.length + 1;

  const lines: string[] = [];

  // Top border with subtle styling
  let top = borderColor(tbl.tl);
  for (let i = 0; i < colWidths.length; i++) {
    top += borderColor(tbl.h.repeat(colWidths[i]));
    if (i < colWidths.length - 1) top += borderColor(tbl.tJoin);
  }
  top += borderColor(tbl.tr);
  lines.push(top);

  // Header row with bold styling
  let header = borderColor(tbl.v);
  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    const w = colWidths[i];
    const text = formatCell(pc.bold(pc.cyan(col.header)), w, 'left');
    header += text + borderColor(tbl.v);
  }
  lines.push(header);

  // Header separator
  let sep = borderColor(tbl.lJoin);
  for (let i = 0; i < colWidths.length; i++) {
    sep += borderColor(tbl.h.repeat(colWidths[i]));
    if (i < colWidths.length - 1) sep += borderColor(tbl.cross);
  }
  sep += borderColor(tbl.rJoin);
  lines.push(sep);

  // Data rows with alternating subtle background
  rows.forEach((row, rowIndex) => {
    let line = borderColor(tbl.v);
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      const w = colWidths[i];
      const rawValue = row[col.key];
      const value = rawValue === undefined ? '' : String(rawValue);
      const color = col.color || ((t: string) => t);
      const text = formatCell(color(value), w, col.align || 'left');
      line += text + borderColor(tbl.v);
    }
    lines.push(line);
  });

  // Bottom border
  let bottom = borderColor(tbl.bl);
  for (let i = 0; i < colWidths.length; i++) {
    bottom += borderColor(tbl.h.repeat(colWidths[i]));
    if (i < colWidths.length - 1) bottom += borderColor(tbl.bJoin);
  }
  bottom += borderColor(tbl.br);
  lines.push(bottom);

  return lines;
}

/**
 * Print a table to stdout.
 */
export function printTable(
  columns: TableColumn[],
  rows: TableRow[],
  options?: { compact?: boolean; borderColor?: (text: string) => string },
): void {
  for (const line of drawTable(columns, rows, options)) {
    console.log(line);
  }
}

/**
 * Render a simple key-value list (no full table, just aligned pairs).
 */
export function drawKeyValue(
  items: { key: string; value: string; secret?: boolean }[],
  keyWidth?: number,
): string[] {
  const maxKeyLen = keyWidth || Math.max(...items.map((i) => stripAnsi(i.key).length));
  return items.map((item) => {
    const val = item.secret ? pc.dim('****') : pc.white(item.value);
    return `  ${pc.gray(pc.bold(padEnd(item.key + ':', maxKeyLen + 2)))} ${val}`;
  });
}

/**
 * Print a key-value list.
 */
export function printKeyValue(
  items: { key: string; value: string; secret?: boolean }[],
  keyWidth?: number,
): void {
  for (const line of drawKeyValue(items, keyWidth)) {
    console.log(line);
  }
}
