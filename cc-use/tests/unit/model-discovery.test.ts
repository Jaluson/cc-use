import { describe, it, expect } from 'vitest';
import { discoverModels } from '../../src/core/model-discovery.js';
import type { ModelDiscoveryConfig } from '../../src/core/types.js';

describe('model-discovery', () => {
  const config: ModelDiscoveryConfig = {
    endpoint: '/v1/models',
    responsePath: 'data',
    idField: 'id',
  };

  it('should handle unreachable endpoint gracefully', async () => {
    const result = await discoverModels(
      'http://localhost:99999',
      'token',
      config,
      100,
    );
    expect(result.success).toBe(false);
    expect(result.models).toEqual([]);
  });

  it('should return error on timeout', async () => {
    const result = await discoverModels(
      'http://localhost:99999',
      'token',
      config,
      50,
    );
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
