import pc from 'picocolors';

export function printBanner(): void {
  const lines = [
    pc.cyan(pc.bold('  ╔═══════════════════════════════════════════╗')),
    pc.cyan(pc.bold('  ║  ')) + pc.white(pc.bold('cc-use')) + pc.gray(' — Claude Code Provider Manager') + pc.cyan(pc.bold('  ║')),
    pc.cyan(pc.bold('  ╚═══════════════════════════════════════════╝')),
  ];
  for (const line of lines) {
    console.log(line);
  }
  console.log();
}

export function printCommandHeader(title: string, description?: string): void {
  console.log();
  console.log(pc.cyan(pc.bold(`◆ ${title}`)));
  if (description) {
    console.log(pc.gray(`  ${description}`));
  }
  console.log(pc.dim('  ' + '─'.repeat(Math.min(title.length + 4, 50))));
  console.log();
}
