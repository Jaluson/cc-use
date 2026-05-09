import pc from 'picocolors';
import { s } from './symbols.js';

// Box-drawing characters
const box = {
  h: '─',
  v: '│',
  tl: '╭',
  tr: '╮',
  bl: '╰',
  br: '╯',
  t: '┬',
  b: '┴',
  l: '├',
  r: '┤',
  m: '┼',
};

interface BoxOptions {
  title?: string;
  padding?: number;
  borderColor?: (text: string) => string;
  titleColor?: (text: string) => string;
  width?: number;
}

/**
 * Draw a bordered box around content lines.
 */
export function drawBox(lines: string[], options: BoxOptions = {}): string[] {
  const {
    title,
    padding = 1,
    borderColor = pc.gray,
    titleColor = (text: string) => pc.bold(pc.cyan(text)),
  } = options;

  // Calculate content width
  let contentWidth = 0;
  for (const line of lines) {
    const visibleLen = stripAnsi(line).length;
    if (visibleLen > contentWidth) contentWidth = visibleLen;
  }

  const innerWidth = contentWidth + padding * 2;
  const totalWidth = innerWidth + 2; // +2 for borders

  const result: string[] = [];

  // Top border
  if (title) {
    const titleStr = ` ${title} `;
    const titleLen = stripAnsi(titleStr).length;
    const leftPad = Math.floor((innerWidth - titleLen) / 2);
    const rightPad = innerWidth - titleLen - leftPad;
    const topLine =
      borderColor(box.tl) +
      borderColor(box.h.repeat(leftPad)) +
      titleColor(titleStr) +
      borderColor(box.h.repeat(rightPad)) +
      borderColor(box.tr);
    result.push(topLine);
  } else {
    result.push(borderColor(box.tl + box.h.repeat(innerWidth) + box.tr));
  }

  // Padding top
  for (let i = 0; i < padding; i++) {
    result.push(borderColor(box.v) + ' '.repeat(innerWidth) + borderColor(box.v));
  }

  // Content lines
  for (const line of lines) {
    const visibleLen = stripAnsi(line).length;
    const rightPad = innerWidth - visibleLen - padding;
    result.push(
      borderColor(box.v) +
      ' '.repeat(padding) +
      line +
      ' '.repeat(Math.max(0, rightPad)) +
      borderColor(box.v),
    );
  }

  // Padding bottom
  for (let i = 0; i < padding; i++) {
    result.push(borderColor(box.v) + ' '.repeat(innerWidth) + borderColor(box.v));
  }

  // Bottom border
  result.push(borderColor(box.bl + box.h.repeat(innerWidth) + box.br));

  return result;
}

/**
 * Draw a double-line bordered box around content lines.
 */
export function drawDoubleBox(lines: string[], options: BoxOptions = {}): string[] {
  const {
    title,
    padding = 1,
    borderColor = pc.gray,
    titleColor = (text: string) => pc.bold(pc.cyan(text)),
  } = options;

  const doubleBox = {
    h: '═',
    v: '║',
    tl: '╔',
    tr: '╗',
    bl: '╚',
    br: '╝',
  };

  let contentWidth = 0;
  for (const line of lines) {
    const visibleLen = stripAnsi(line).length;
    if (visibleLen > contentWidth) contentWidth = visibleLen;
  }

  const innerWidth = contentWidth + padding * 2;
  const result: string[] = [];

  // Top border
  if (title) {
    const titleStr = ` ${title} `;
    const titleLen = stripAnsi(titleStr).length;
    const leftPad = Math.floor((innerWidth - titleLen) / 2);
    const rightPad = innerWidth - titleLen - leftPad;
    result.push(
      borderColor(doubleBox.tl) +
      borderColor(doubleBox.h.repeat(leftPad)) +
      titleColor(titleStr) +
      borderColor(doubleBox.h.repeat(rightPad)) +
      borderColor(doubleBox.tr),
    );
  } else {
    result.push(borderColor(doubleBox.tl + doubleBox.h.repeat(innerWidth) + doubleBox.tr));
  }

  // Padding top
  for (let i = 0; i < padding; i++) {
    result.push(borderColor(doubleBox.v) + ' '.repeat(innerWidth) + borderColor(doubleBox.v));
  }

  // Content lines
  for (const line of lines) {
    const visibleLen = stripAnsi(line).length;
    const rightPad = innerWidth - visibleLen - padding;
    result.push(
      borderColor(doubleBox.v) +
      ' '.repeat(padding) +
      line +
      ' '.repeat(Math.max(0, rightPad)) +
      borderColor(doubleBox.v),
    );
  }

  // Padding bottom
  for (let i = 0; i < padding; i++) {
    result.push(borderColor(doubleBox.v) + ' '.repeat(innerWidth) + borderColor(doubleBox.v));
  }

  // Bottom border
  result.push(borderColor(doubleBox.bl + doubleBox.h.repeat(innerWidth) + doubleBox.br));

  return result;
}

/**
 * Print a bordered box to stdout.
 */
export function printBox(lines: string[], options?: BoxOptions): void {
  for (const line of drawBox(lines, options)) {
    console.log(line);
  }
}

/**
 * Print a double-line bordered box to stdout.
 */
export function printDoubleBox(lines: string[], options?: BoxOptions): void {
  for (const line of drawDoubleBox(lines, options)) {
    console.log(line);
  }
}

/**
 * Draw a horizontal separator line.
 */
export function separator(width: number = 40, char: string = box.h): string {
  return pc.dim(char.repeat(width));
}

/**
 * Print a section header with a separator line.
 */
export function printSection(title: string): void {
  console.log();
  console.log(pc.cyan(pc.bold(`${s.chevron} ${title}`)));
  console.log(pc.dim('─'.repeat(Math.min(title.length + 4, 60))));
}

// Simple ANSI stripper for width calculation
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\[[0-9;]*m/g, '');
}
