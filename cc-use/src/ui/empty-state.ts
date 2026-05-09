import pc from 'picocolors';
import { s } from './symbols.js';
import { printDoubleBox } from './box.js';

export function printEmptyState(
  message: string,
  hint?: string,
): void {
  const lines = [
    pc.dim(`${s.ellipsis} ${message}`),
  ];
  if (hint) {
    lines.push('');
    lines.push(pc.dim(`  ${s.arrow} ${hint}`));
  }
  printDoubleBox(lines, {
    borderColor: pc.dim,
    padding: 1,
  });
}
