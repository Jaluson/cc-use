import pc from 'picocolors';

// Semantic color system - Industrial precision tool aesthetic
// Picocolors doesn't support chaining (pc.bold.cyan), so we compose functions
export const c = {
  brand: pc.cyan,
  brandBold: (text: string) => pc.bold(pc.cyan(text)),
  success: pc.green,
  successBold: (text: string) => pc.bold(pc.green(text)),
  warning: pc.yellow,
  warningBold: (text: string) => pc.bold(pc.yellow(text)),
  error: pc.red,
  errorBold: (text: string) => pc.bold(pc.red(text)),
  info: pc.blue,
  infoBold: (text: string) => pc.bold(pc.blue(text)),
  muted: pc.gray,
  mutedBold: (text: string) => pc.bold(pc.gray(text)),
  dim: pc.dim,
  bold: pc.bold,
  white: pc.white,
  whiteBold: (text: string) => pc.bold(pc.white(text)),
};

// Text styling helpers
export const style = {
  header: (text: string) => pc.bold(pc.white(text)),
  subheader: (text: string) => pc.bold(pc.cyan(text)),
  label: (text: string) => pc.bold(pc.gray(text)),
  value: (text: string) => pc.white(text),
  hint: (text: string) => pc.dim(text),
  path: (text: string) => pc.underline(pc.cyan(text)),
  code: (text: string) => pc.inverse(text),
  secret: () => pc.dim('****'),
};
