import pc from 'picocolors';
import { s } from './symbols.js';

export function success(message: string): void {
  console.log(pc.green(`${s.success} ${message}`));
}

export function error(message: string): void {
  console.log(pc.red(`${s.error} ${message}`));
}

export function warning(message: string): void {
  console.log(pc.yellow(`${s.warning} ${message}`));
}

export function info(message: string): void {
  console.log(pc.blue(`${s.info} ${message}`));
}

export function dim(message: string): void {
  console.log(pc.dim(`${s.bullet} ${message}`));
}

export function bullet(message: string, color: 'white' | 'gray' | 'cyan' = 'white'): void {
  const colors: Record<string, (text: string) => string> = {
    white: pc.white,
    gray: pc.gray,
    cyan: pc.cyan,
  };
  console.log(colors[color](`${s.bullet} ${message}`));
}
