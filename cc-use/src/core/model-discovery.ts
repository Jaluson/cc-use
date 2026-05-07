import type { ModelDiscoveryConfig } from './types.js';

export interface DiscoveryResult {
  models: string[];
  success: boolean;
  error?: string;
}

export async function discoverModels(
  baseUrl: string,
  token: string,
  config: ModelDiscoveryConfig,
  timeoutMs: number = 10000,
): Promise<DiscoveryResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const url = `${baseUrl.replace(/\/$/, '')}${config.endpoint}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return { models: [], success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const models = extractModelIds(data, config);
    return { models, success: true };
  } catch (error) {
    return {
      models: [],
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function extractModelIds(data: unknown, config: ModelDiscoveryConfig): string[] {
  let current = data;

  if (config.responsePath) {
    const parts = config.responsePath.split('.');
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return [];
      }
    }
  }

  if (!Array.isArray(current)) {
    return [];
  }

  const idField = config.idField || 'id';
  return current
    .map((item) => {
      if (item && typeof item === 'object' && idField in (item as Record<string, unknown>)) {
        return String((item as Record<string, unknown>)[idField]);
      }
      return String(item);
    })
    .filter(Boolean);
}
