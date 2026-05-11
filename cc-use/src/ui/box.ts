import pc from 'picocolors';
import { s } from './symbols.js';
import { stripAnsi } from './ansi.js';

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

const doubleBoxChars = {
  h: '═',
  v: '║',
  tl: '╔',
  tr: '╗',
  bl: '╚',
  br: '╝',
};

interface BoxOptions {
  title?: string;
  padding?: number;
  borderColor?: (text: string) => string;
  titleColor?: (text: string) => string;
  width?: number;
}

interface BoxChars {
  h: string;
  v: string;
  tl: string;
  tr: string;
  bl: string;
  br: string;
}

function renderBox(lines: string[], chars: BoxChars, options: BoxOptions = {}): string[] {
  const {
    title,
    padding = 1,
    borderColor = pc.gray,
    titleColor = (text: string) => pc.bold(pc.cyan(text)),
  } = options;

  let contentWidth = 0;
  for (const line of lines) {
    const visibleLen = stripAnsi(line).length;
    if (visibleLen > contentWidth) contentWidth = visibleLen;
  }

  const innerWidth = contentWidth + padding * 2;
  const result: string[] = [];

  if (title) {
    const titleStr = ` ${title} `;
    const titleLen = stripAnsi(titleStr).length;
    const leftPad = Math.floor((innerWidth - titleLen) / 2);
    const rightPad = innerWidth - titleLen - leftPad;
    result.push(
      borderColor(chars.tl) +
      borderColor(chars.h.repeat(leftPad)) +
      titleColor(titleStr) +
      borderColor(chars.h.repeat(rightPad)) +
      borderColor(chars.tr),
    );
  } else {
    result.push(borderColor(chars.tl + chars.h.repeat(innerWidth) + chars.tr));
  }

  for (let i = 0; i < padding; i++) {
    result.push(borderColor(chars.v) + ' '.repeat(innerWidth) + borderColor(chars.v));
  }

  for (const line of lines) {
    const visibleLen = stripAnsi(line).length;
    const rightPad = innerWidth - visibleLen - padding;
    result.push(
      borderColor(chars.v) +
      ' '.repeat(padding) +
      line +
      ' '.repeat(Math.max(0, rightPad)) +
      borderColor(chars.v),
    );
  }

  for (let i = 0; i < padding; i++) {
    result.push(borderColor(chars.v) + ' '.repeat(innerWidth) + borderColor(chars.v));
  }

  result.push(borderColor(chars.bl + chars.h.repeat(innerWidth) + chars.br));
  return result;
}

export function drawBox(lines: string[], options: BoxOptions = {}): string[] {
  return renderBox(lines, box, options);
}

export function drawDoubleBox(lines: string[], options: BoxOptions = {}): string[] {
  return renderBox(lines, doubleBoxChars, options);
}

export function printBox(lines: string[], options?: BoxOptions): void {
  for (const line of drawBox(lines, options)) {
    console.log(line);
  }
}

export function printDoubleBox(lines: string[], options?: BoxOptions): void {
  for (const line of drawDoubleBox(lines, options)) {
    console.log(line);
  }
}

export function separator(width: number = 40, char: string = box.h): string {
  return pc.dim(char.repeat(width));
}

export function printSection(title: string): void {
  console.log();
  console.log(pc.cyan(pc.bold(`${s.chevron} ${title}`)));
  console.log(pc.dim('─'.repeat(Math.min(title.length + 4, 60))));
}
