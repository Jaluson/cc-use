import pc from 'picocolors';
import { printBox } from './box.js';

export function printEmptyState(
  message: string,
  hint?: string,
): void {
  const lines = [pc.gray(message)];
  if (hint) {
    lines.push('');
    lines.push(pc.dim(`  ${hint}`));
  }
  printBox(lines, {
    borderColor: pc.dim,
    padding: 1,
  });
}
