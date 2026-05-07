import envPaths from 'env-paths';
import { join } from 'node:path';
import type { ConfigPaths } from './types.js';

const APP_NAME = 'cc-use';

export function getConfigPaths(): ConfigPaths {
  const paths = envPaths(APP_NAME, { suffix: '' });
  return {
    home: paths.config,
    profiles: join(paths.config, 'profiles'),
    presets: join(paths.config, 'presets'),
    config: join(paths.config, 'config.json'),
  };
}
